import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.requestReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.box}>
        <div style={styles.logoRow}>
          <span style={styles.logo}>WORK<span style={styles.logoAccent}>LOG</span></span>
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div style={styles.successWrap}>
            <div style={styles.successIcon}>✉️</div>
            <h2 style={styles.successTitle}>Check your inbox</h2>
            <p style={styles.successText}>
              If that email is registered, you'll receive a reset link shortly.
              The link expires in <strong style={{ color: 'var(--text-primary)' }}>20 minutes</strong>.
            </p>
            <p style={styles.successText}>
              Didn't get it? Check your spam folder, or make sure the email
              matches your account.
            </p>
            <Link to="/login" style={styles.backLink}>← Back to login</Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <p style={styles.tagline}>Password Reset</p>
            <div className="divider" style={{ margin: '20px 0' }} />
            <p style={styles.description}>
              Enter the email address associated with your account and we'll
              send you a reset link.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '11px 0' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Sending…
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <p style={styles.backLinkWrap}>
              <Link to="/login" style={styles.backLink}>← Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  box: {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px',
    boxShadow: 'var(--shadow)',
  },
  logoRow: { textAlign: 'center', marginBottom: '8px' },
  logo: {
    fontFamily: 'var(--font-mono)',
    fontSize: '22px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    letterSpacing: '0.05em',
  },
  logoAccent: { color: 'var(--accent)' },
  tagline: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
  },
  description: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    marginBottom: '20px',
  },
  backLinkWrap: { textAlign: 'center', marginTop: '20px' },
  backLink: {
    fontSize: '13px',
    color: 'var(--accent)',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '8px',
  },
  successWrap: { textAlign: 'center', padding: '8px 0' },
  successIcon: { fontSize: '36px', marginBottom: '16px' },
  successTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    marginBottom: '12px',
  },
};