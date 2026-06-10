import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';
import AppFooter from '../../components/AppFooter';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-main">
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon icon-surface"><Leaf size={20} /></div>
            <div>
              <span className="auth-logo-name">Kijani Terrascape</span>
              <span className="auth-logo-sub">Digital Learning Journey</span>
            </div>
          </Link>
          <div className="auth-left-content">
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <h2 className="auth-left-headline">
              Forgot your<br />
              <span>password?</span><br />
              No worries.
            </h2>
            <p>Enter your email and we'll send you a secure link to reset your password.</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">

          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <span className="icon-surface icon-surface-lg" style={{ marginBottom: '1.25rem' }}><CheckCircle size={28} /></span>
              <h2 style={{ marginBottom: '0.5rem', color: 'var(--g-900)' }}>Check your inbox</h2>
              <p style={{ color: 'var(--grey-500)', marginBottom: '2rem', lineHeight: 1.6 }}>
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                The link expires in <strong>1 hour</strong>.
              </p>
              <p style={{ fontSize: '.82rem', color: 'var(--grey-400)', marginBottom: '1.5rem' }}>
                Don't see it? Check your spam folder.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Back to Login <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h1>Reset Password</h1>
                <p>Enter the email linked to your account</p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '.85rem' }}>
                    <AlertCircle size={15} /> {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? 'Sending…' : <> Send Reset Link <ArrowRight size={17} /> </>}
                </button>
              </form>

              <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
                Remember it? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
      </div>
      <AppFooter variant="compact" />
    </div>
  );
}
