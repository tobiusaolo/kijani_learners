import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Info, Loader } from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import {
  getAssessmentInstrument,
  getMyAssessments,
  submitAssessment,
  unwrapResponse,
} from '../../api/cachedLearnerApi';
import { cachedData, assessmentsPageLoading } from '../../utils/staleLoad';
import { showError, apiErrorMessage } from '../../utils/swal';
import { runGamificationEvent } from '../../utils/gamificationRunner';
import GrowthChart from '../../components/gamification/GrowthChart';

function applyAssessmentData(instrument, myList, assessmentType, setters) {
  const done = (myList || []).some((a) => a.type === assessmentType);
  setters.setAlreadyDone(done);
  if (!done) {
    setters.setQuestions(instrument?.questions || []);
  }
}

export default function Assessment() {
  const { type: routeType } = useParams();
  const assessmentType = routeType === 'endline' ? 'endline' : 'baseline';
  const isEndline = assessmentType === 'endline';
  const instrumentKey = `assessments:instrument:${assessmentType}`;

  const cachedInstrument = cachedData(instrumentKey, 'assessments');
  const cachedMy = cachedData('assessments:my', 'assessments');

  const [questions, setQuestions] = useState(() => {
    const done = (cachedMy || []).some((a) => a.type === assessmentType);
    return done ? [] : (cachedInstrument?.questions || []);
  });
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(() => assessmentsPageLoading(assessmentType));
  const [submitting, setSubmitting] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(() =>
    (cachedMy || []).some((a) => a.type === assessmentType),
  );
  const [myAssessments, setMyAssessments] = useState(() => cachedMy || []);

  useEffect(() => {
    const hasCache = cachedData(instrumentKey, 'assessments') || cachedData('assessments:my', 'assessments');
    if (!hasCache) setLoading(true);

    Promise.all([
      getAssessmentInstrument(assessmentType),
      getMyAssessments(),
    ])
      .then(([instrumentRes, myRes]) => {
        const myList = unwrapResponse(myRes) || [];
        setMyAssessments(myList);
        applyAssessmentData(
          unwrapResponse(instrumentRes),
          myList,
          assessmentType,
          { setAlreadyDone, setQuestions },
        );
      })
      .catch((err) => console.error('Failed to load assessment', err))
      .finally(() => setLoading(false));
  }, [assessmentType, instrumentKey]);

  const isComplete = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {};
      questions.forEach((q) => { payload[q.id] = answers[q.id]; });
      const { data } = await submitAssessment(assessmentType, payload);
      setScore(data.systems_thinking_score);
      setSubmitted(true);
      setMyAssessments((prev) => [...prev.filter((a) => a.type !== assessmentType), { type: assessmentType, ...data }]);
      runGamificationEvent(assessmentType === 'baseline' ? 'baseline_done' : 'endline_done');
    } catch (err) {
      console.error('Failed to submit assessment', err);
      showError('Submission failed', apiErrorMessage(err, 'Failed to submit assessment.'));
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEndline ? 'Endline Assessment' : 'Baseline Assessment';
  const subtitle = isEndline ? 'Measure your systems thinking growth' : 'Systems Thinking Baseline Survey';

  if (loading) {
    return (
      <LearnerLayout title={title} subtitle={subtitle}>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <span className="icon-surface icon-surface-md"><Loader size={24} className="spin" /></span>
          <p style={{ marginTop: '1rem', color: 'var(--grey-600)' }}>Loading assessment…</p>
        </div>
      </LearnerLayout>
    );
  }

  if (alreadyDone && !submitted) {
    return (
      <LearnerLayout title={title} subtitle={subtitle}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="icon-surface icon-surface-lg" style={{ marginBottom: '1rem' }}><CheckCircle size={28} /></span>
          <h2>{isEndline ? 'Endline' : 'Baseline'} assessment already completed</h2>
          <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>
            You have already submitted this assessment. Thank you!
          </p>
          <Link to="/learn/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout title={title} subtitle={subtitle}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {!submitted ? (
          <>
            <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--g-50)', borderColor: 'var(--g-200)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span className="icon-surface icon-surface-sm"><Info size={16} /></span>
                <div>
                  <h4 style={{ color: 'var(--g-800)', marginBottom: '0.5rem' }}>
                    {isEndline ? 'Endline Systems Thinking Survey' : 'Welcome to your Baseline Assessment'}
                  </h4>
                  <p style={{ color: 'var(--g-700)', fontSize: '.9rem', lineHeight: 1.6 }}>
                    {isEndline
                      ? 'Reflect on how your understanding of integrated conservation and systems thinking has evolved. This is not graded — answer honestly.'
                      : 'This survey helps us understand your perspective before you begin. This is not a graded test. You will take a similar assessment at the end of the programme.'}
                  </p>
                </div>
              </div>
            </div>

            {questions.map((q, index) => (
              <div key={q.id} className="card" style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                  <span style={{ color: 'var(--g-500)', marginRight: '8px' }}>{index + 1}.</span>
                  {q.question}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {q.options.map((opt, oIndex) => (
                    <label
                      key={oIndex}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem',
                        borderRadius: 'var(--r-md)',
                        border: `1px solid ${answers[q.id] === oIndex ? 'var(--g-500)' : 'var(--grey-200)'}`,
                        background: answers[q.id] === oIndex ? 'var(--g-50)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[q.id] === oIndex}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oIndex }))}
                        style={{ marginTop: '4px', accentColor: 'var(--g-500)' }}
                      />
                      <span style={{ fontSize: '.95rem', color: 'var(--grey-700)' }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2rem 0 4rem' }}>
              <button className="btn btn-primary btn-lg" disabled={!isComplete || submitting} onClick={handleSubmit}>
                {submitting ? 'Submitting…' : `Submit ${isEndline ? 'Endline' : 'Baseline'} Assessment`}
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <span className="icon-surface icon-surface-lg" style={{ marginBottom: '1rem' }}><CheckCircle size={28} /></span>
            <h2>Assessment Completed!</h2>
            {score !== null && (
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--g-700)', margin: '1rem 0' }}>
                Systems Thinking Score: {score}%
              </p>
            )}
            <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Thank you. Your responses have been securely saved.
            </p>
            <div className="card" style={{ maxWidth: 420, margin: '0 auto 2rem', padding: '1.5rem' }}>
              <GrowthChart assessments={myAssessments} />
            </div>
            <Link to={isEndline ? '/learn/certificate' : '/learn/dashboard'} className="btn btn-primary btn-lg">
              {isEndline ? 'View Certificate' : 'Go to Dashboard'}
            </Link>
          </div>
        )}
      </div>
    </LearnerLayout>
  );
}
