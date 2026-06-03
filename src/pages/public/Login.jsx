import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const resetSuccess = location.state?.resetSuccess;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate('/learn/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
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
              Continue your<br />
              <span>conservation</span><br />
              journey.
            </h2>
            <p>Pick up where you left off. Your progress, reflections, and community await.</p>
            <div className="auth-features">
              {['Immersive 6-module curriculum', 'Systems thinking framework', 'African conservation case studies', 'Digital storytelling hub'].map((f, i) => (
                <div key={i} className="auth-feature-item">
                  <span className="auth-feature-dot" />
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
            <h1>Welcome back</h1>
            <p>Sign in to your Kijani account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {resetSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '.85rem', color: '#166534' }}>
                <CheckCircle size={15} /> Password updated successfully. Please sign in.
              </div>
            )}
            {error && <div style={{color: 'red', marginBottom: '1rem', fontSize: '14px', textAlign: 'center'}}>{error}</div>}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <div className="pw-label-row">
                <label className="form-label">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="pw-input-wrap">
                <input
                  className="form-input"
                  type={show ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShow(!show)}>
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Signing In...' : <>Sign In <ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="btn btn-ghost" style={{ width: '100%', border: '1px solid var(--grey-200)' }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
            Continue with Google
          </button>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register">Register here</Link>
          </p>

          <div className="auth-demo-links">
            <span>Demo access:</span>
            <div style={{fontSize: '12px', marginTop: '4px', color: '#666'}}>
              Test Learner: admin@kijani.org / Admin1234!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
