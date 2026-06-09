import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import apiClient from '../../api/client';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // No token in URL — show helpful error
  if (!token) {
    return (
      <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '2rem' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Invalid Reset Link</h2>
          <p style={{ color: 'var(--grey-500)', marginBottom: '1.5rem' }}>
            This reset link is missing or malformed. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { resetSuccess: true } }), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. The link may have expired.');
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
              Choose a<br />
              <span>new</span><br />
              password.
            </h2>
            <p>Make it strong and unique. You'll use it every time you log in.</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">

          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle size={52} color="#16a34a" style={{ marginBottom: '1.25rem' }} />
              <h2 style={{ marginBottom: '0.5rem', color: 'var(--g-900)' }}>Password Updated!</h2>
              <p style={{ color: 'var(--grey-500)', lineHeight: 1.6 }}>
                Your password has been changed. A confirmation email has been sent to you.
                Redirecting to login…
              </p>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h1>Set New Password</h1>
                <p>Choose a strong password for your account</p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '.85rem' }}>
                    <AlertCircle size={15} /> {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="pw-input-wrap">
                    <input
                      className="form-input"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {password && (
                    <div style={{ marginTop: '0.4rem', display: 'flex', gap: '4px' }}>
                      {['var(--error)', '#f59e0b', '#16a34a'].map((color, i) => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: password.length >= (i + 1) * 4 ? color : 'var(--grey-200)',
                          transition: 'background .2s'
                        }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    className="form-input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    style={{ borderColor: confirm && confirm !== password ? '#ef4444' : '' }}
                  />
                  {confirm && confirm !== password && (
                    <div style={{ fontSize: '.75rem', color: '#ef4444', marginTop: '0.3rem' }}>Passwords don't match</div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? 'Updating…' : <><Lock size={15} /> Update Password</>}
                </button>
              </form>

              <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
                <Link to="/forgot-password">Request a new link instead</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
