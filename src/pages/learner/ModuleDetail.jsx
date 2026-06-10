import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpen, Play, CheckCircle, Edit3, MessageSquare, Download,
  ChevronRight, ChevronLeft, Loader, Lock, FileText, ArrowRight,
} from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import {
  saveReflection,
  getForumPosts,
  createForumPost,
  getModuleDetail,
  updateProgress,
} from '../../api/cachedLearnerApi';
import { recordActivity } from '../../api/learnerApi';
import { cachedData, showPageLoading } from '../../utils/staleLoad';
import QuizTaker from '../../components/QuizTaker';
import InteractiveScenario from '../../components/InteractiveScenario';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { showError } from '../../utils/swal';
import { recordActivitySeconds } from '../../utils/masteryStorage';
import { runGamificationEvent } from '../../utils/gamificationRunner';
import { celebrateModuleComplete } from '../../utils/celebrate';
import { getTopicReadingSections, splitParagraphs } from '../../utils/topicSections';
import { getModuleContentSections } from '../../utils/moduleSections';
import {
  getReflectionPromptSubsections,
  countWords,
  REFLECTION_WORD_LIMIT,
} from '../../utils/moduleReflectionPrompt';
import './ModuleDetail.css';

function renderLegacyEssayContent(content) {
  if (!content?.trim()) return null;
  return content.split(/\n\n+/).map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('## ')) {
      return <h4 key={i}>{trimmed.replace(/^##\s*/, '')}</h4>;
    }
    if (trimmed.startsWith('# ')) {
      return <h3 key={i}>{trimmed.replace(/^#\s*/, '')}</h3>;
    }
    return <p key={i}>{trimmed}</p>;
  });
}

function renderModuleContentSections(module) {
  const sections = getModuleContentSections(module);
  if (!sections.length) return null;

  return (
    <div className="module-content-sections">
      {sections.map((section, sectionIndex) => (
        <section key={`${section.title}-${sectionIndex}`} className="module-content-section">
          {section.title ? (
            <h3 className="module-content-section-title">{section.title}</h3>
          ) : null}
          <div className="module-content-subsections">
            {section.subsections.map((subsection, subIndex) => (
              <article key={`${subsection.title}-${subIndex}`} className="module-content-subsection">
                {subsection.title ? (
                  <h4 className="module-content-subsection-title">{subsection.title}</h4>
                ) : null}
                {subsection.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className="module-content-paragraph">{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function renderTopicReading(topic) {
  const sections = getTopicReadingSections(topic);
  if (sections?.length) {
    return sections.map((section, index) => (
      <article key={`${section.title}-${index}`} className="topic-reading-section">
        {section.title ? (
          <h4 className="topic-reading-section-title">{section.title}</h4>
        ) : null}
        {splitParagraphs(section.body).map((paragraph, pIndex) => (
          <p key={pIndex} className="topic-reading-section-text">{paragraph}</p>
        ))}
      </article>
    ));
  }

  if (topic?.content?.trim()) {
    return <div className="topic-reading-legacy">{renderLegacyEssayContent(topic.content)}</div>;
  }

  return (
    <p className="text-muted">
      No reading content has been added for this topic yet.
    </p>
  );
}

function buildSteps(moduleData) {
  if (!moduleData) return [];
  const steps = [
    { id: 'intro', type: 'intro', label: 'Introduction', shortLabel: 'Intro' },
  ];
  if (moduleData.pre_quiz_id) {
    steps.push({
      id: 'pre',
      type: 'pre',
      label: 'Pre-assessment',
      shortLabel: 'Pre',
      quizId: moduleData.pre_quiz_id,
    });
  }
  (moduleData.topics || []).forEach((topic, index) => {
    steps.push({
      id: `topic-${topic.id}`,
      type: 'topic',
      topicIndex: index,
      label: topic.title,
      shortLabel: `Topic ${index + 1}`,
    });
  });
  if (moduleData.post_quiz_id) {
    steps.push({
      id: 'post',
      type: 'post',
      label: moduleData.post_quiz_title || 'Post-assessment',
      shortLabel: 'Final',
      quizId: moduleData.post_quiz_id,
    });
  }
  steps.push(
    { id: 'reflection', type: 'reflection', label: 'Reflection', shortLabel: 'Reflect' },
    { id: 'discussion', type: 'discussion', label: 'Discussion', shortLabel: 'Discuss' },
  );
  return steps;
}

function initialStepIndex(steps, moduleData) {
  if (!moduleData || !steps.length) return 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.type === 'intro') {
      if (moduleData.intro_video_url && !moduleData.intro_video_done) return i;
      continue;
    }
    if (step.type === 'pre' && !moduleData.pre_assessment_done) return i;
    if (step.type === 'topic') continue;
    if (step.type === 'post' && !moduleData.post_assessment_done) return i;
  }
  const firstTopic = steps.findIndex((s) => s.type === 'topic');
  if (firstTopic >= 0 && !moduleData.post_assessment_done) {
    return firstTopic;
  }
  return Math.max(0, steps.length - 1);
}

export default function ModuleDetail() {
  const { id } = useParams();
  const moduleNum = id || '1';
  const moduleCacheKey = `modules:detail:${moduleNum}`;
  const initialModule = cachedData(moduleCacheKey, 'modules');

  const [moduleData, setModuleData] = useState(initialModule);
  const [loading, setLoading] = useState(() => showPageLoading(moduleCacheKey, 'modules'));
  const [locked, setLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [stepIndex, setStepIndex] = useState(() =>
    (initialModule ? initialStepIndex(buildSteps(initialModule), initialModule) : 0),
  );
  const [topicQuizReady, setTopicQuizReady] = useState({});

  const [reflection, setReflection] = useState(initialModule?.reflection_text || '');
  const [reflectionSaved, setReflectionSaved] = useState(Boolean(initialModule?.reflection_text));
  const [savingReflection, setSavingReflection] = useState(false);

  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [postingDiscussion, setPostingDiscussion] = useState(false);
  const [forumLoading, setForumLoading] = useState(false);

  const steps = useMemo(() => buildSteps(moduleData), [moduleData]);
  const currentStep = steps[stepIndex] || null;
  const topics = moduleData?.topics || [];
  const activeTopic =
    currentStep?.type === 'topic' ? topics[currentStep.topicIndex] : null;
  const progressPct = moduleData?.progress_pct ?? 0;

  const reloadModule = useCallback(() =>
    getModuleDetail(moduleNum, { force: true }).then((res) => {
      setModuleData(res.data);
      if (res.data.reflection_text) {
        setReflection(res.data.reflection_text);
        setReflectionSaved(true);
      }
      return res.data;
    }), [moduleNum]);

  useEffect(() => {
    const cacheKey = moduleCacheKey;
    const cached = cachedData(cacheKey, 'modules');
    if (cached) {
      setModuleData(cached);
      if (cached.reflection_text) {
        setReflection(cached.reflection_text);
        setReflectionSaved(true);
      }
      const built = buildSteps(cached);
      setStepIndex(initialStepIndex(built, cached));
      setLocked(false);
      setLoading(false);
    } else {
      setLoading(true);
    }
    getModuleDetail(moduleNum, { force: true })
      .then((res) => {
        setModuleData(res.data);
        if (res.data.reflection_text) {
          setReflection(res.data.reflection_text);
          setReflectionSaved(true);
        }
        const built = buildSteps(res.data);
        setStepIndex(initialStepIndex(built, res.data));
        setLocked(false);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setLocked(true);
          setLockReason(err.response?.data?.detail || 'This module is locked.');
        } else {
          console.error('Failed to load module', err);
        }
      })
      .finally(() => setLoading(false));
  }, [moduleNum]);

  useEffect(() => {
    if (locked || loading) return undefined;
    const tick = () => {
      recordActivitySeconds(30);
      recordActivity(moduleNum, 30).catch(() => {});
    };
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [moduleNum, locked, loading]);

  const openedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!moduleData || locked || openedRef.current) return;
    openedRef.current = true;
    runGamificationEvent('module_open');
  }, [moduleData, locked]);

  useEffect(() => {
    if (!moduleData || completedRef.current) return;
    if (moduleData.progress_pct >= 100 || moduleData.status === 'completed') {
      completedRef.current = true;
      celebrateModuleComplete(moduleData.title);
      runGamificationEvent('module_complete');
    }
  }, [moduleData?.progress_pct, moduleData?.status, moduleData?.title]);

  useEffect(() => {
    if (currentStep?.type !== 'discussion') return;
    setForumLoading(true);
    getForumPosts(moduleNum)
      .then((res) => setDiscussions(res.data || []))
      .catch((err) => console.error('Failed to load discussions', err))
      .finally(() => setForumLoading(false));
  }, [currentStep?.type, moduleNum]);

  const markIntroVideoDone = async () => {
    if (moduleData?.intro_video_done) return true;
    try {
      await updateProgress(moduleNum, { intro_video_done: true });
      setModuleData((prev) => (prev ? { ...prev, intro_video_done: true } : prev));
      runGamificationEvent('intro_video');
      return true;
    } catch (err) {
      console.error('Failed to update video progress', err);
      return false;
    }
  };

  const goNext = useCallback(() => {
    setStepIndex((i) => {
      const max = Math.max(0, steps.length - 1);
      return Math.min(i + 1, max);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [steps.length]);

  const handleIntroContinue = async () => {
    if (moduleData?.intro_video_url && !moduleData?.intro_video_done) {
      await markIntroVideoDone();
    }
    goNext();
  };

  const goBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canContinueTopic = (topic) => {
    if (!topic?.quiz_id) return true;
    return !!topicQuizReady[topic.id];
  };

  const markTopicQuizReady = (topicId) => {
    if (!topicId) return;
    setTopicQuizReady((prev) => ({ ...prev, [topicId]: true }));
  };

  const handleSaveReflection = async (advance = false) => {
    if (!reflection.trim()) {
      showError('Reflection required', 'Please write your reflection before saving.');
      return;
    }
    if (reflectionOverLimit) {
      showError('Word limit exceeded', `Your reflection must be ${REFLECTION_WORD_LIMIT} words or fewer.`);
      return;
    }
    setSavingReflection(true);
    try {
      await saveReflection(moduleNum, reflection.trim());
      setReflectionSaved(true);
      await reloadModule();
      runGamificationEvent('reflection');
      if (advance) goNext();
    } catch (err) {
      console.error('Failed to save reflection', err);
      const msg = err.response?.data?.detail || 'Please try again.';
      showError('Could not save reflection', msg);
    } finally {
      setSavingReflection(false);
    }
  };

  const handlePostDiscussion = async () => {
    if (!newDiscussion.trim()) return;
    setPostingDiscussion(true);
    try {
      await createForumPost({
        module_id: moduleNum,
        title: `Module ${moduleNum} Discussion`,
        content: newDiscussion,
      });
      setNewDiscussion('');
      const res = await getForumPosts(moduleNum);
      setDiscussions(res.data || []);
      runGamificationEvent('forum_post');
    } catch (err) {
      showError('Could not post', 'Failed to post discussion.');
    } finally {
      setPostingDiscussion(false);
    }
  };

  const getInitials = (userId) =>
    userId ? userId.substring(0, 2).toUpperCase() : '??';

  if (loading) {
    return (
      <LearnerLayout title="Loading module…" subtitle="">
        <div className="module-loading-state">
          <Loader size={24} className="spin" />
          <span>Loading module…</span>
        </div>
      </LearnerLayout>
    );
  }

  if (locked) {
    return (
      <LearnerLayout title="Module Locked" subtitle="">
        <div className="card module-locked-card">
          <span className="icon-surface icon-surface-lg"><Lock size={26} /></span>
          <h3>This module is locked</h3>
          <p className="text-muted">{lockReason}</p>
          <Link to="/learn/modules" className="btn btn-primary">
            Back to My Modules
          </Link>
        </div>
      </LearnerLayout>
    );
  }

  const reflectionPromptSubsections = getReflectionPromptSubsections(moduleData);
  const reflectionWordCount = countWords(reflection);
  const reflectionOverLimit = reflectionWordCount > REFLECTION_WORD_LIMIT;
  const moduleContentSections = getModuleContentSections(moduleData);
  const topicsWithStructuredReading = topics.filter(
    (t) => getTopicReadingSections(t)?.length || t.content?.trim(),
  ).length;
  const hasReflectionPrompt = reflectionPromptSubsections.length > 0;

  const discussionPrompts = [
    'What idea from this module will you apply in your community?',
    'Which reading or video changed how you see conservation?',
    'What question do you still want to explore with peers?',
  ];

  return (
    <LearnerLayout
      title={`Module ${moduleData?.num || moduleNum} · ${moduleData?.title || ''}`}
      subtitle=""
    >
      <div className="module-detail-wrap module-detail-fullwidth">
        <div className="module-progress-bar">
          <div className="module-progress-bar-meta">
            <Link to="/learn/modules" className="module-back-link">
              ← My Modules
            </Link>
            <span className="module-progress-pct">{progressPct}% complete</span>
          </div>
          <div className="module-progress-track">
            <div
              className="module-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="module-stepper" role="tablist" aria-label="Module steps">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={idx === stepIndex}
              className={`module-step-pill ${idx === stepIndex ? 'active' : ''} ${idx < stepIndex ? 'done' : ''}`}
              onClick={() => setStepIndex(idx)}
            >
              <span className="module-step-num">{idx + 1}</span>
              <span className="module-step-label">{step.shortLabel || step.label}</span>
            </button>
          ))}
        </div>

        <div className="module-step-content card">
          {currentStep?.type === 'intro' && (
            <section className="module-step-panel">
              <header className="module-step-header">
                <span className="module-step-kicker">
                  Step {stepIndex + 1} · Module {moduleData?.num || moduleNum}
                </span>
                <h2>
                  {moduleData?.emoji || '📚'} {moduleData?.title}
                </h2>
              </header>

              {moduleData?.intro_video_url ? (
                <div className="module-media-block">
                  <video
                    controls
                    className="module-video-player"
                    src={resolveAssetUrl(moduleData.intro_video_url)}
                    onEnded={markIntroVideoDone}
                  />
                  {moduleData.intro_video_done && (
                    <span className="badge badge-success module-done-badge">✓ Video watched</span>
                  )}
                </div>
              ) : (
                <div className="module-empty-inline">
                  No module intro video yet — read the overview below to continue.
                </div>
              )}

              {moduleData?.description && (
                <div className="module-description-block">
                  <h3>About this module</h3>
                  <p>{moduleData.description}</p>
                </div>
              )}

              <div className="module-learning-overview">
                <h3 className="module-section-title">Your learning path</h3>
                <ul className="module-learning-overview-list">
                  {moduleContentSections.length > 0 && (
                    <li>
                      <strong>{moduleContentSections.length}</strong> structured module section
                      {moduleContentSections.length !== 1 ? 's' : ''} to read below
                    </li>
                  )}
                  {moduleData?.has_pre_assessment && (
                    <li>Pre-assessment before topics</li>
                  )}
                  {topics.length > 0 && (
                    <li>
                      <strong>{topics.length}</strong> topic{topics.length !== 1 ? 's' : ''}
                      {topicsWithStructuredReading > 0
                        ? ` with structured readings`
                        : ''}
                    </li>
                  )}
                  {moduleData?.has_post_assessment && (
                    <li>Post-assessment after topics</li>
                  )}
                  <li>
                    Reflection essay
                    {hasReflectionPrompt ? ' with facilitator prompts' : ''}
                    {' '}(max {REFLECTION_WORD_LIMIT} words)
                  </li>
                  <li>Module discussion with peers</li>
                </ul>
              </div>

              {renderModuleContentSections(moduleData)}

              {moduleData?.intro_video_url && !moduleData?.intro_video_done && (
                <p className="module-intro-hint text-sm text-muted">
                  Watch the video if you can, then continue. You can also use
                  &quot;Mark video as watched&quot; after viewing.
                </p>
              )}

              <StepNav
                onBack={null}
                onNext={handleIntroContinue}
                nextLabel="Continue to next step"
                secondaryAction={
                  moduleData?.intro_video_url && !moduleData?.intro_video_done
                    ? () => markIntroVideoDone()
                    : undefined
                }
                secondaryLabel="Mark video as watched"
              />
            </section>
          )}

          {currentStep?.type === 'pre' && (
            <section className="module-step-panel">
              <header className="module-step-header">
                <span className="module-step-kicker">Step {stepIndex + 1}</span>
                <h2>Pre-assessment</h2>
                <p className="text-muted">
                  Complete this formative assessment before working through the topics.
                </p>
              </header>
              <QuizTaker
                quizId={currentStep.quizId}
                onComplete={async (data) => {
                  if (data.passed) {
                    await reloadModule();
                    goNext();
                  }
                }}
              />
              {moduleData?.pre_assessment_done && (
                <StepNav onBack={goBack} onNext={goNext} nextLabel="Continue to topics" />
              )}
            </section>
          )}

          {currentStep?.type === 'topic' && activeTopic && (
            <section className="module-step-panel">
              <header className="module-step-header">
                <span className="module-step-kicker">
                  Step {stepIndex + 1} · Topic {currentStep.topicIndex + 1} of {topics.length}
                </span>
                <h2>{activeTopic.title}</h2>
              </header>

              {activeTopic.intro_video_url && (
                <div className="module-media-block">
                  <h3 className="module-section-title">
                    <Play size={18} /> Topic video
                  </h3>
                  <video
                    controls
                    className="module-video-player"
                    src={resolveAssetUrl(activeTopic.intro_video_url)}
                  />
                </div>
              )}

              {activeTopic.description && (
                <div className="module-description-block">
                  <h3>About this topic</h3>
                  <p>{activeTopic.description}</p>
                </div>
              )}

              <div className="module-essay-block">
                <h3 className="module-section-title">
                  <BookOpen size={18} /> Reading
                  {activeTopic.estimated_minutes
                    ? ` · ~${activeTopic.estimated_minutes} min`
                    : ''}
                </h3>
                <div className="reading-body module-essay-body topic-reading-body">
                  {renderTopicReading(activeTopic)}
                </div>
              </div>

              {moduleNum === '2' && currentStep.topicIndex === 0 && (
                <div className="module-scenario-block" style={{ marginTop: '1.5rem' }}>
                  <p className="text-xs text-muted" style={{ marginBottom: '0.75rem' }}>
                    Optional field decision — explore trade-offs (does not affect your grade).
                  </p>
                  <InteractiveScenario />
                </div>
              )}

              {activeTopic.resources?.length > 0 && (
                <div className="module-materials-section">
                  <h3 className="module-section-title">
                    <FileText size={18} /> Materials
                  </h3>
                  <div className="materials-list">
                    {activeTopic.resources.map((res) => (
                      <a
                        key={res.id}
                        href={resolveAssetUrl(res.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="material-item"
                      >
                        <span className="material-type">
                          {res.file_type?.toUpperCase()}
                        </span>
                        <span className="material-title">{res.title}</span>
                        <Download size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {activeTopic.quiz_id ? (
                <div className="module-quiz-block">
                  <h3 className="module-section-title">
                    <CheckCircle size={18} /> Topic quiz
                  </h3>
                  <QuizTaker
                    quizId={activeTopic.quiz_id}
                    onComplete={(data) => {
                      if (data.passed) {
                        markTopicQuizReady(activeTopic.id);
                        reloadModule();
                      }
                    }}
                  />
                </div>
              ) : null}

              <StepNav
                onBack={goBack}
                onNext={goNext}
                nextLabel={
                  currentStep.topicIndex < topics.length - 1
                    ? 'Next topic'
                    : 'Continue'
                }
                nextDisabled={!canContinueTopic(activeTopic)}
              />
            </section>
          )}

          {currentStep?.type === 'post' && (
            <section className="module-step-panel">
              <header className="module-step-header">
                <span className="module-step-kicker">Step {stepIndex + 1}</span>
                <h2>{currentStep.label}</h2>
                <p className="text-muted">
                  Final assessment for this module — complete it to finish the learning path.
                </p>
              </header>
              <QuizTaker
                quizId={currentStep.quizId}
                onComplete={async (data) => {
                  if (data.passed) {
                    await reloadModule();
                    goNext();
                  }
                }}
              />
              <StepNav onBack={goBack} onNext={goNext} nextLabel="Continue to reflection" />
            </section>
          )}

          {currentStep?.type === 'reflection' && (
            <section className="module-step-panel">
              <header className="module-step-header">
                <span className="module-step-kicker">Step {stepIndex + 1}</span>
                <h2>Module reflection</h2>
                {reflectionSaved && moduleData?.reflection_text && (
                  <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                    Reflection submitted
                  </span>
                )}
              </header>
              <div className="module-reflection-prompts">
                <h3 className="module-section-title">Reflection prompts</h3>
                {reflectionPromptSubsections.length > 0 ? (
                  reflectionPromptSubsections.map((sub, subIndex) => (
                    <article key={`${sub.title}-${subIndex}`} className="reflection-prompt-block">
                      {sub.title ? <h4 className="reflection-prompt-subtitle">{sub.title}</h4> : null}
                      {sub.paragraphs.map((paragraph, pIndex) => (
                        <p key={pIndex} className="reflection-prompt-text">{paragraph}</p>
                      ))}
                    </article>
                  ))
                ) : (
                  <div className="reflection-prompt-card">
                    <span className="icon-surface icon-surface-md"><BookOpen size={22} /></span>
                    <div>
                      <h4>Reflection prompt</h4>
                      <p>
                        {moduleData?.description ||
                          `Reflect on what you learned in ${moduleData?.title || 'this module'}.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <div className="reflection-essay-header">
                  <label className="form-label">Your reflection essay</label>
                  <span className={`reflection-word-count ${reflectionOverLimit ? 'over-limit' : ''}`}>
                    {reflectionWordCount} / {REFLECTION_WORD_LIMIT} words
                  </span>
                </div>
                <p className="text-sm text-muted" style={{ marginBottom: '0.75rem' }}>
                  Write a structured response addressing the prompts above. Maximum {REFLECTION_WORD_LIMIT} words.
                </p>
                <textarea
                  className="form-input form-textarea module-reflection-input"
                  placeholder="Begin writing your reflection essay here…"
                  value={reflection}
                  onChange={(e) => {
                    setReflection(e.target.value);
                    setReflectionSaved(false);
                  }}
                  disabled={savingReflection}
                />
                {reflectionOverLimit && (
                  <p className="reflection-limit-warning">
                    Please shorten your essay to {REFLECTION_WORD_LIMIT} words or fewer before submitting.
                  </p>
                )}
              </div>
              <StepNav
                onBack={goBack}
                onNext={() => handleSaveReflection(true)}
                nextLabel={savingReflection ? 'Saving…' : 'Submit & continue'}
                nextDisabled={savingReflection || !reflection.trim() || reflectionOverLimit}
                secondaryAction={() => handleSaveReflection(false)}
                secondaryLabel="Save draft"
              />
            </section>
          )}

          {currentStep?.type === 'discussion' && (
            <section className="module-step-panel">
              <header className="module-step-header">
                <span className="module-step-kicker">Step {stepIndex + 1}</span>
                <h2>Module discussion</h2>
                <p className="text-muted module-step-lead">
                  Connect with learners working through {moduleData?.title || `Module ${moduleNum}`}.
                  Your post appears in this module&apos;s forum thread.
                </p>
              </header>

              <div className="module-discussion-wrap">
                <div className="discussion-prompt-card">
                  <div className="discussion-prompt-icon" aria-hidden>
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h4>What to share</h4>
                    <p>
                      Add a short reflection or question tied to this module—not a general comment.
                      Peers and facilitators can respond in the thread below.
                    </p>
                    <ul className="discussion-prompt-list">
                      {discussionPrompts.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="discussion-compose-card">
                  <label className="form-label" htmlFor="module-discussion-input">
                    Your post
                  </label>
                  <p className="discussion-compose-hint">
                    Write clearly; aim for a few sentences or a short paragraph.
                  </p>
                  <textarea
                    id="module-discussion-input"
                    className="form-input discussion-compose-input"
                    placeholder="Example: The community governance section made me rethink how we involve youth in wetland restoration near my town…"
                    value={newDiscussion}
                    onChange={(e) => setNewDiscussion(e.target.value)}
                    disabled={postingDiscussion}
                    rows={5}
                  />
                  <div className="discussion-compose-footer">
                    <span className="discussion-char-count">
                      {newDiscussion.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handlePostDiscussion}
                      disabled={postingDiscussion || !newDiscussion.trim()}
                    >
                      {postingDiscussion ? 'Posting…' : 'Post to module forum'}
                      <MessageSquare size={16} style={{ marginLeft: 6 }} />
                    </button>
                  </div>
                </div>

                <div className="discussion-thread-section">
                  <div className="discussion-thread-header">
                    <h3 className="module-section-title">
                      <MessageSquare size={18} /> Peers in this module
                    </h3>
                    {!forumLoading && discussions.length > 0 && (
                      <span className="badge badge-brand">{discussions.length} post{discussions.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>

                  <div className="discussion-list">
                    {forumLoading ? (
                      <div className="module-loading-state">
                        <Loader size={24} className="spin" />
                        <span>Loading thread…</span>
                      </div>
                    ) : discussions.length === 0 ? (
                      <div className="discussion-empty-state">
                        <span className="icon-surface icon-surface-md"><MessageSquare size={22} /></span>
                        <p><strong>No posts yet</strong></p>
                        <p className="text-sm text-muted">Be the first to start the conversation for this module.</p>
                      </div>
                    ) : (
                      discussions.map((d, i) => (
                        <article key={d.id || i} className="discussion-post">
                          <div className="forum-author-avatar" title={d.author_name || 'Learner'}>
                            {getInitials(d.user_id)}
                          </div>
                          <div className="discussion-post-body">
                            <div className="discussion-post-meta">
                              <strong>{d.author_name || 'Learner'}</strong>
                              {d.created_at && (
                                <time dateTime={d.created_at}>
                                  {new Date(d.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </time>
                              )}
                            </div>
                            <p className="discussion-post-content">{d.content}</p>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <StepNav
                onBack={goBack}
                onNext={null}
                nextLabel={
                  <Link to="/learn/modules" className="btn btn-primary">
                    Back to My Modules <ArrowRight size={15} />
                  </Link>
                }
              />
            </section>
          )}
        </div>
      </div>
    </LearnerLayout>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  secondaryAction,
  secondaryLabel,
}) {
  return (
    <footer className="module-step-nav">
      {onBack ? (
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ChevronLeft size={16} /> Previous
        </button>
      ) : (
        <span />
      )}
      <div className="module-step-nav-right">
        {secondaryAction && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={secondaryAction}>
            {secondaryLabel}
          </button>
        )}
        {onNext && typeof onNext === 'function' ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNext}
            disabled={nextDisabled}
          >
            {nextLabel} <ChevronRight size={16} />
          </button>
        ) : (
          nextLabel
        )}
      </div>
    </footer>
  );
}
