import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Simple strength indicator
  const strength =
    password.length === 0 ? null
    : password.length < 6  ? 'weak'
    : password.length < 10 ? 'fair'
    : 'strong';

  const strengthColor = { weak: 'var(--red)', fair: 'var(--accent)', strong: 'var(--green)' };
  const strengthWidth = { weak: '33%', fair: '66%', strong: '100%' };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      // Redirect to login after 2.5 seconds
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err.message || 'Reset failed. The link may have expired.');
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

        {success ? (
          /* ── Success state ── */
          <div style={styles.successWrap}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Password updated</h2>
            <p style={styles.successText}>
              Your password has been changed successfully.
              Redirecting you to login…
            </p>
            <div style={styles.redirectBar}>
              <div style={styles.redirectProgress} />
            </div>
            <Link to="/login" style={styles.backLink}>Go to login now →</Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <p style={styles.tagline}>Set New Password</p>
            <div className="divider" style={{ margin: '20px 0' }} />

            {!token && (
              <div className="alert alert-error">
                Invalid reset link. Please request a new one.
              </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">New password</label>
                <input
                  id="password"
                  type="password"
                  autoFocus
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
                {/* Strength bar */}
                {strength && (
                  <div style={styles.strengthWrap}>
                    <div style={styles.strengthTrack}>
                      <div style={{
                        ...styles.strengthBar,
                        width: strengthWidth[strength],
                        background: strengthColor[strength],
                      }} />
                    </div>
                    <span style={{ ...styles.strengthLabel, color: strengthColor[strength] }}>
                      {strength}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label htmlFor="confirm">Confirm new password</label>
                <input
                  id="confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  style={
                    confirm && password !== confirm
                      ? { borderColor: 'var(--red)' }
                      : confirm && password === confirm
                      ? { borderColor: 'var(--green)' }
                      : {}
                  }
                />
                {confirm && password !== confirm && (
                  <span style={styles.matchError}>Passwords don't match</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !token}
                style={{ width: '100%', justifyContent: 'center', padding: '11px 0' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Updating…
                  </>
                ) : (
                  'Update password'
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
  strengthWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px',
  },
  strengthTrack: {
    flex: 1,
    height: '3px',
    background: 'var(--border)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.3s ease, background 0.3s ease',
  },
  strengthLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    minWidth: '36px',
  },
  matchError: {
    fontSize: '11px',
    color: 'var(--red)',
    fontFamily: 'var(--font-mono)',
    marginTop: '4px',
  },
  backLinkWrap: { textAlign: 'center', marginTop: '20px' },
  backLink: {
    fontSize: '13px',
    color: 'var(--accent)',
    textDecoration: 'none',
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
    marginBottom: '20px',
  },
  redirectBar: {
    height: '3px',
    background: 'var(--border)',
    borderRadius: '99px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  redirectProgress: {
    height: '100%',
    background: 'var(--green)',
    borderRadius: '99px',
    animation: 'growWidth 2.5s linear forwards',
    width: '0%',
  },
};