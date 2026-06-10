import { useState, useEffect, useRef } from 'react';
import { CheckCircle, RotateCcw, Loader, XCircle } from 'lucide-react';
import {
  getQuizForTake,
  getMyQuizAttempts,
  submitQuizAttempt,
  unwrapResponse,
} from '../api/cachedLearnerApi';
import { cachedData, quizPageLoading } from '../utils/staleLoad';
import { showError, apiErrorMessage } from '../utils/swal';
import { recordQuizScore } from '../utils/masteryStorage';
import { runGamificationEvent } from '../utils/gamificationRunner';
import { celebrateQuizPass } from '../utils/celebrate';
import MasteryChip, { masteryFromQuiz } from './gamification/MasteryChip';

/**
 * Learner quiz UI — shows a compact score summary when already attempted;
 * full questions only when taking or retaking ("Try again").
 */
export default function QuizTaker({ quizId, onComplete }) {
  const takeKey = `quizzes:take:${quizId}`;
  const attemptsKey = `quizzes:attempts:${quizId}`;
  const cachedQuiz = quizId ? cachedData(takeKey, 'modules') : null;
  const cachedAttempts = quizId ? cachedData(attemptsKey, 'modules') : null;

  const [quiz, setQuiz] = useState(cachedQuiz);
  const [latestAttempt, setLatestAttempt] = useState(cachedAttempts?.[0] || null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(() => (quizId ? quizPageLoading(quizId) : false));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [retaking, setRetaking] = useState(false);
  const notifiedPassRef = useRef(false);

  useEffect(() => {
    if (!quizId) return undefined;
    const hasCache = cachedData(takeKey, 'modules') || cachedData(attemptsKey, 'modules');
    if (!hasCache) setLoading(true);
    setError(null);
    setRetaking(false);
    setResult(null);
    setAnswers({});
    notifiedPassRef.current = false;

    Promise.all([
      getQuizForTake(quizId, { force: true }),
      getMyQuizAttempts(quizId, { force: true }),
    ])
      .then(([quizRes, attemptsRes]) => {
        setQuiz(unwrapResponse(quizRes));
        const attempts = unwrapResponse(attemptsRes) || [];
        setLatestAttempt(attempts[0] || null);
      })
      .catch(() => setError('Could not load this assessment.'))
      .finally(() => setLoading(false));

    return undefined;
  }, [quizId, takeKey, attemptsKey]);

  const summaryAttempt = result || latestAttempt;
  const showCompact = Boolean(summaryAttempt && !retaking);

  useEffect(() => {
    if (!showCompact || !summaryAttempt?.passed || notifiedPassRef.current) return;
    notifiedPassRef.current = true;
    onComplete?.(summaryAttempt);
  }, [showCompact, summaryAttempt, onComplete]);

  const questions = quiz?.questions || [];
  const allAnswered = questions.every((q) => {
    const a = answers[q.id];
    return Array.isArray(a) ? a.length > 0 : a !== undefined;
  });

  const toggleAnswer = (question, optionIndex) => {
    setAnswers((prev) => {
      const current = prev[question.id] || [];
      if (question.question_type === 'single') {
        return { ...prev, [question.id]: [optionIndex] };
      }
      const set = new Set(current);
      if (set.has(optionIndex)) set.delete(optionIndex);
      else set.add(optionIndex);
      return { ...prev, [question.id]: [...set].sort((a, b) => a - b) };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {};
      for (const q of questions) {
        payload[String(q.id)] = answers[q.id] || [];
      }
      const { data } = await submitQuizAttempt(quizId, payload);
      setResult(data);
      setLatestAttempt(data);
      setRetaking(false);
      if (data.score != null) recordQuizScore(quizId, data.score);
      if (data.passed) {
        notifiedPassRef.current = true;
        celebrateQuizPass(data.score);
        runGamificationEvent('quiz_pass', {
          quizScore: data.score,
          quizAttemptNumber: data.attempt_number,
        });
        onComplete?.(data);
      }
    } catch (err) {
      showError('Submit failed', apiErrorMessage(err, 'Failed to submit. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTryAgain = async () => {
    setRetaking(true);
    setResult(null);
    setAnswers({});
    setLoading(true);
    try {
      const quizRes = await getQuizForTake(quizId, { force: true });
      setQuiz(unwrapResponse(quizRes));
    } catch {
      setError('Could not load the latest questions. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--grey-400)' }}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '0.75rem' }}>Loading assessment…</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--grey-500)' }}>
        {error || 'No assessment available for this module yet.'}
      </div>
    );
  }

  if (showCompact && summaryAttempt) {
    const passed = summaryAttempt.passed;
    const score = summaryAttempt.score ?? 0;
    const passMark = summaryAttempt.pass_mark ?? quiz.pass_mark ?? 70;
    const correct = summaryAttempt.correct_count;
    const total = summaryAttempt.total_questions ?? questions.length;
    const showBreakdown = correct != null && total > 0;
    const mastery = masteryFromQuiz(score, passed);

    return (
      <div className="module-quiz-wrap quiz-compact-summary">
        <h3 className="quiz-compact-title">{quiz.title}</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <MasteryChip label={mastery.label} variant={mastery.variant} />
        </div>
        <div className={`quiz-compact-score-row ${passed ? 'pass' : 'fail'}`}>
          {passed ? <CheckCircle size={28} /> : <XCircle size={28} />}
          <div>
            <div className="quiz-compact-score">
              {score}% — {passed ? 'Passed' : 'Not passed'}
            </div>
            <p className="quiz-compact-meta text-sm text-muted">
              {showBreakdown && `${correct} of ${total} correct · `}
              Pass mark: {passMark}%
              {summaryAttempt.attempt_number > 1 &&
                ` · Attempt #${summaryAttempt.attempt_number}`}
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleTryAgain}>
          <RotateCcw size={15} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="module-quiz-wrap">
      <div className="quiz-header">
        <div>
          <h3>{quiz.title}</h3>
          <p className="text-sm text-muted">
            {questions.length} question{questions.length !== 1 ? 's' : ''} · Pass mark:{' '}
            {quiz.pass_mark}% · Marked automatically on submit
          </p>
        </div>
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="quiz-question-card">
          <div className="quiz-q-num">Q{qi + 1}</div>
          <p className="quiz-q-text">{q.question_text}</p>
          {q.question_type === 'multiple' && (
            <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
              Select all that apply
            </p>
          )}
          <div className="quiz-options">
            {q.options.map((opt, oi) => {
              const selected = (answers[q.id] || []).includes(oi);
              return (
                <label key={oi} className={`quiz-option ${selected ? 'selected' : ''}`}>
                  <input
                    type={q.question_type === 'single' ? 'radio' : 'checkbox'}
                    name={`q-${q.id}`}
                    checked={selected}
                    onChange={() => toggleAnswer(q, oi)}
                  />
                  <span className="quiz-option-letter">{String.fromCharCode(65 + oi)}</span>
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="quiz-actions">
        {retaking && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRetaking(false)}>
            Cancel
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary btn-lg"
          disabled={!allAnswered || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit & Get My Score'}
        </button>
      </div>
    </div>
  );
}
