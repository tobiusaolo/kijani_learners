import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Check, ArrowRight, ArrowLeft, Loader } from 'lucide-react';
import { submitApplication } from '../../api/learnerApi';
import { showSuccess, showError, apiErrorMessage } from '../../utils/swal';
import AppFooter from '../../components/AppFooter';
import './Apply.css';

const STORAGE_KEY = 'kijani_apply_draft';
const steps = ['About You', 'Your Context', 'Commitment', 'Review'];

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  country: '',
  region: '',
  gender: 'Female',
  urban_rural: 'Urban',
  background: 'University Student',
  motivation: '',
  conservation_challenge: '',
  systems_awareness: '',
  commitment_confirmed: false,
  data_consent: false,
};

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const form = { ...initialForm, ...(parsed.form || {}) };
    if (!['Male', 'Female'].includes(form.gender)) {
      form.gender = 'Female';
    }
    return {
      step: typeof parsed.step === 'number' ? parsed.step : 0,
      form,
    };
  } catch {
    return null;
  }
}

function displayValue(value) {
  if (value === null || value === undefined) return '—';
  const s = String(value).trim();
  return s || '—';
}

function ReviewRow({ label, value }) {
  return (
    <div className="apply-review-row">
      <span className="apply-review-label">{label}</span>
      <span className="apply-review-value">{displayValue(value)}</span>
    </div>
  );
}

function ReviewTextBlock({ label, value }) {
  const text = displayValue(value);
  return (
    <div className="apply-review-text-block">
      <span className="apply-review-text-label">{label}</span>
      <p className="apply-review-text-value">{text === '—' ? 'Not provided' : text}</p>
    </div>
  );
}

function ReviewSection({ title, children }) {
  return (
    <section className="apply-review-section">
      <h4 className="apply-review-section-title">{title}</h4>
      <div className="apply-review-section-body">{children}</div>
    </section>
  );
}

export default function Apply() {
  const draft = loadDraft();
  const [step, setStep] = useState(draft?.step ?? 0);
  const [form, setForm] = useState(draft?.form ?? initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, form }));
  }, [step, form, submitted]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const goBack = () => setStep((s) => Math.max(0, s - 1));
  const goNext = () => setStep((s) => Math.min(steps.length - 1, s + 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitApplication({
        ...form,
        commitment_confirmed: true,
        data_consent: form.data_consent,
      });
      sessionStorage.removeItem(STORAGE_KEY);
      await showSuccess(
        'Application submitted!',
        'We have received your application. You will be notified by email once it has been reviewed.',
      );
      setSubmitted(true);
    } catch (err) {
      await showError(
        'Submission failed',
        apiErrorMessage(err, 'Failed to submit application. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="apply-page">
        <div className="apply-container" style={{ justifyContent: 'center' }}>
          <div className="apply-form-panel card" style={{ maxWidth: 520, textAlign: 'center', padding: '3rem' }}>
            <span className="icon-surface icon-surface-lg" style={{ marginBottom: '1rem' }}><Check size={28} /></span>
            <h2>Application Submitted!</h2>
            <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>
              We have received your application. You will be notified by email once reviewed.
            </p>
            <Link to="/login" className="btn btn-primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <nav className="apply-nav">
        <Link to="/" className="apply-logo">
          <div className="apply-logo-icon icon-surface"><Leaf size={18} /></div>
          <span>Kijani Terrascape</span>
        </Link>
        <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
      </nav>

      <div className="apply-container">
        <div className="apply-info">
          <div className="apply-info-badge">📋 Applications Open</div>
          <h1>Apply</h1>
          <p>Join African youth leaders on a transformative conservation learning journey.</p>
        </div>

        <div className="apply-form-panel">
          <div className="apply-steps">
            {steps.map((s, i) => (
              <div key={i} className={`apply-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="apply-step-circle">{i < step ? <Check size={14} /> : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="apply-form-body">
            {step === 0 && (
              <>
                <h3>Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-input" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" value={form.country} onChange={(e) => set('country', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <select className="form-input" value={form.region} onChange={(e) => set('region', e.target.value)}>
                      <option value="">Select…</option>
                      {['East Africa', 'West Africa', 'Central Africa', 'Southern Africa', 'North Africa'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Urban / Rural</label>
                    <select className="form-input" value={form.urban_rural} onChange={(e) => set('urban_rural', e.target.value)}>
                      <option>Urban</option>
                      <option>Rural</option>
                      <option>Peri-urban</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Background</label>
                  <select className="form-input" value={form.background} onChange={(e) => set('background', e.target.value)}>
                    <option>University Student</option>
                    <option>NGO / Civil Society</option>
                    <option>Community Leader</option>
                    <option>Government</option>
                    <option>Researcher</option>
                    <option>Other</option>
                  </select>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h3>Your Conservation Context</h3>
                <div className="form-group">
                  <label className="form-label">Motivation Statement</label>
                  <textarea
                    className="form-input form-textarea"
                    style={{ minHeight: '130px' }}
                    value={form.motivation}
                    onChange={(e) => set('motivation', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Conservation Challenge</label>
                  <textarea
                    className="form-input form-textarea"
                    style={{ minHeight: '110px' }}
                    value={form.conservation_challenge}
                    onChange={(e) => set('conservation_challenge', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Systems Awareness (optional)</label>
                  <textarea
                    className="form-input form-textarea"
                    style={{ minHeight: '90px' }}
                    value={form.systems_awareness}
                    onChange={(e) => set('systems_awareness', e.target.value)}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3>Commitment & Consent</h3>
                <div className="apply-commitment">
                  <label className="apply-check-row">
                    <input
                      type="checkbox"
                      checked={form.commitment_confirmed}
                      onChange={(e) => set('commitment_confirmed', e.target.checked)}
                    />
                    <span>I confirm availability to complete all modules and produce a storytelling output.</span>
                  </label>
                  <label className="apply-check-row">
                    <input
                      type="checkbox"
                      checked={form.data_consent}
                      onChange={(e) => set('data_consent', e.target.checked)}
                    />
                    <span>I consent to anonymised data use for programme monitoring and evaluation.</span>
                  </label>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3>Review & Submit</h3>
                <p className="apply-review-intro text-muted">
                  Review everything you entered below. Use Back to edit any step — your answers are saved as you move between steps.
                </p>

                <ReviewSection title="About You">
                  <ReviewRow label="First name" value={form.first_name} />
                  <ReviewRow label="Last name" value={form.last_name} />
                  <ReviewRow label="Email" value={form.email} />
                  <ReviewRow label="Country" value={form.country} />
                  <ReviewRow label="Region" value={form.region} />
                  <ReviewRow label="Gender" value={form.gender} />
                  <ReviewRow label="Urban / Rural" value={form.urban_rural} />
                  <ReviewRow label="Background" value={form.background} />
                </ReviewSection>

                <ReviewSection title="Your Context">
                  <ReviewTextBlock label="Motivation statement" value={form.motivation} />
                  <ReviewTextBlock label="Conservation challenge" value={form.conservation_challenge} />
                  <ReviewTextBlock label="Systems awareness" value={form.systems_awareness} />
                </ReviewSection>

                <ReviewSection title="Commitment & Consent">
                  <ReviewRow
                    label="Module & storytelling commitment"
                    value={form.commitment_confirmed ? 'Confirmed' : 'Not confirmed'}
                  />
                  <ReviewRow
                    label="Data use consent"
                    value={form.data_consent ? 'Consented' : 'Not consented'}
                  />
                </ReviewSection>
              </>
            )}
          </div>

          <div className="apply-form-footer">
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={goBack}>
                <ArrowLeft size={15} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < steps.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={goNext}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting || !form.commitment_confirmed || !form.data_consent}
                onClick={handleSubmit}
              >
                {submitting ? <Loader size={16} className="spin" /> : <Check size={15} />}
                {submitting ? ' Submitting…' : ' Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
      <AppFooter variant="compact" />
    </div>
  );
}
