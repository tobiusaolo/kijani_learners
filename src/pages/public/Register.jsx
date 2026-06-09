import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import './Auth.css';

const steps = ['Personal Info', 'Background', 'Commitment'];

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    country: '', region: '', gender: 'Female', background: '',
    motivation: '', challenge: '', commitment: false, consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const buildBio = () => {
    const parts = [];
    if (form.motivation?.trim()) parts.push(form.motivation.trim());
    if (form.challenge?.trim()) parts.push(`Conservation challenge:\n${form.challenge.trim()}`);
    return parts.join('\n\n') || undefined;
  };

  const handleSubmit = async () => {
    if (!form.commitment || !form.consent) {
      setError("Please check all required agreements.");
      return;
    }
    if (form.gender !== 'Male' && form.gender !== 'Female') {
      setError('Please select Male or Female.');
      return;
    }
    if (!form.motivation?.trim()) {
      setError('Please add your motivation statement.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
        country: form.country,
        region: form.region,
        gender: form.gender,
        background: form.background,
        bio: buildBio(),
        role: "learner"
      });
      navigate('/learn/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon"><Leaf size={20} /></div>
            <div>
              <span className="auth-logo-name">Kijani Terrascape</span>
              <span className="auth-logo-sub">Digital Learning Journey</span>
            </div>
          </Link>
          <div className="auth-left-content">
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <h2 className="auth-left-headline">
              Join 100 African<br />
              <span>conservation</span><br />
              leaders.
            </h2>
            <p>Apply for Cohort 1 of the Kijani Terrascape Digital Learning Journey. No advanced expertise required — just curiosity, commitment, and passion for Africa's future.</p>
            <div className="auth-features">
              {['Open to all African youth', '50% female participation target', 'Self-paced, mobile-friendly', 'Certificate upon completion'].map((f, i) => (
                <div key={i} className="auth-feature-item">
                  <Check size={14} color="var(--g-300)" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Create Account</h1>
            <p>Step {step + 1} of {steps.length} — {steps[step]}</p>
          </div>

          {/* Progress Steps */}
          <div className="register-steps">
            {steps.map((_, i) => (
              <div key={i} className={`reg-step ${i < step ? 'done' : i === step ? 'active' : ''}`} />
            ))}
          </div>

          {error && <div style={{color: 'red', marginBottom: '1rem', fontSize: '14px', textAlign: 'center'}}>{error}</div>}

          {/* Step 0 — Personal Info */}
          {step === 0 && (
            <div className="auth-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" placeholder="Amara" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" placeholder="Nwosu" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input" value={form.gender} onChange={e => update('gender', e.target.value)} required>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" placeholder="Kenya" value={form.country} onChange={e => update('country', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <select className="form-input" value={form.region} onChange={e => update('region', e.target.value)}>
                    <option value="">Select region</option>
                    <option>East Africa</option><option>West Africa</option><option>Central Africa</option>
                    <option>Southern Africa</option><option>North Africa</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => update('password', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1 — Background */}
          {step === 1 && (
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">Professional Background</label>
                <select className="form-input" value={form.background} onChange={e => update('background', e.target.value)}>
                  <option value="">Select background</option>
                  <option>University Student</option><option>NGO / Civil Society</option>
                  <option>Community Leader</option><option>Government / Public Sector</option>
                  <option>Private Sector</option><option>Researcher / Academic</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Motivation Statement <span style={{ color: 'var(--grey-400)' }}>(200–300 words)</span></label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Why do you want to join the Kijani Terrascape learning journey? What do you hope to achieve?"
                  value={form.motivation}
                  onChange={e => update('motivation', e.target.value)}
                  style={{ minHeight: '120px' }}
                />
                <span style={{ fontSize: '.75rem', color: 'var(--grey-400)' }}>{form.motivation.split(/\s+/).filter(Boolean).length} / 300 words</span>
              </div>
              <div className="form-group">
                <label className="form-label">Conservation Challenge in Your Context</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Describe a specific conservation challenge facing your community or region."
                  value={form.challenge}
                  onChange={e => update('challenge', e.target.value)}
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
          )}

          {/* Step 2 — Commitment */}
          {step === 2 && (
            <div className="auth-form">
              <div className="reg-commitment-card">
                <h4 style={{ color: 'var(--g-800)', marginBottom: '0.5rem' }}>Programme Commitment</h4>
                <p style={{ fontSize: '.88rem', color: 'var(--grey-600)', lineHeight: 1.6 }}>
                  The Kijani Terrascape journey requires approximately 2 hours of self-paced learning, completion of all 6 modules, and creation of one digital storytelling output.
                </p>
              </div>
              <label className="reg-check-label">
                <input type="checkbox" checked={form.commitment} onChange={e => update('commitment', e.target.checked)} />
                <span>I confirm I have the time and commitment to complete all modules and produce a digital storytelling output.</span>
              </label>
              <label className="reg-check-label">
                <input type="checkbox" checked={form.consent} onChange={e => update('consent', e.target.checked)} />
                <span>I consent to my data being used for programme monitoring and anonymised reporting in accordance with the <a href="#" style={{ color: 'var(--g-500)' }}>Privacy Policy</a>.</span>
              </label>
              <div className="reg-summary">
                <p><strong>Name:</strong> {form.firstName} {form.lastName}</p>
                <p><strong>Email:</strong> {form.email}</p>
                <p><strong>Country:</strong> {form.country} · {form.region}</p>
                <p><strong>Background:</strong> {form.background}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            {step > 0 && (
              <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--grey-200)' }} onClick={prev}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={next}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Submitting...' : <>Submit Application <Check size={16} /></>}
              </button>
            )}
          </div>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
