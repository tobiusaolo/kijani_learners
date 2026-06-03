import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { resolveAssetUrl } from '../../utils/assetUrl';
import { showError } from '../../utils/swal';
import './ModuleDetail.css';

function renderEssayContent(content) {
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
    getModuleDetail(moduleNum).then((res) => {
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
    getModuleDetail(moduleNum)
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
    const tick = () => recordActivity(moduleNum, 30).catch(() => {});
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [moduleNum, locked, loading]);

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
    setSavingReflection(true);
    try {
      await saveReflection(moduleNum, reflection);
      setReflectionSaved(true);
      await reloadModule();
      if (advance) goNext();
    } catch (err) {
      console.error('Failed to save reflection', err);
      showError('Could not save reflection', 'Please try again.');
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
          <Lock size={40} color="var(--grey-400)" />
          <h3>This module is locked</h3>
          <p className="text-muted">{lockReason}</p>
          <Link to="/learn/modules" className="btn btn-primary">
            Back to My Modules
          </Link>
        </div>
      </LearnerLayout>
    );
  }

  const reflectionPrompt =
    moduleData?.description ||
    `Reflect on what you learned in ${moduleData?.title || 'this module'}.`;

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
                    <span className="badge badge-green module-done-badge">✓ Video watched</span>
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
                <div className="reading-body module-essay-body">
                  {activeTopic.content
                    ? renderEssayContent(activeTopic.content)
                    : (
                      <p className="text-muted">
                        No reading content has been added for this topic yet.
                      </p>
                    )}
                </div>
              </div>

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
              </header>
              <div className="reflection-prompt-card">
                <span style={{ fontSize: '2rem' }}>✍️</span>
                <div>
                  <h4>Reflection prompt</h4>
                  <p>{reflectionPrompt}</p>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your reflection</label>
                <textarea
                  className="form-input form-textarea module-reflection-input"
                  placeholder="Begin writing your reflection here…"
                  value={reflection}
                  onChange={(e) => {
                    setReflection(e.target.value);
                    setReflectionSaved(false);
                  }}
                  disabled={savingReflection}
                />
              </div>
              <StepNav
                onBack={goBack}
                onNext={() => handleSaveReflection(true)}
                nextLabel={savingReflection ? 'Saving…' : 'Save & continue'}
                nextDisabled={savingReflection || !reflection.trim()}
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
              </header>
              <div className="new-post-card">
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px' }}
                  placeholder={`Share your thoughts about Module ${moduleNum}…`}
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  disabled={postingDiscussion}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.5rem' }}
                  onClick={handlePostDiscussion}
                  disabled={postingDiscussion || !newDiscussion.trim()}
                >
                  {postingDiscussion ? 'Posting…' : 'Post'}
                </button>
              </div>
              <div className="discussion-list">
                {forumLoading ? (
                  <div className="module-loading-state">
                    <Loader size={24} className="spin" />
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="module-empty-inline">No discussions yet. Be the first!</div>
                ) : (
                  discussions.map((d, i) => (
                    <div key={d.id || i} className="discussion-post">
                      <div className="forum-author-avatar">{getInitials(d.user_id)}</div>
                      <div className="discussion-post-body">
                        <p>{d.content}</p>
                      </div>
                    </div>
                  ))
                )}
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
