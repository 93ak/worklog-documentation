import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
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
        <p style={styles.tagline}>Daily work logging for teams</p>

        <div className="divider" style={{ margin: '24px 0' }} />

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your.username"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
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
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <a href="/forgot-password" style={{ color: 'var(--accent)' }}>
            Forgot password?
          </a>
        </p>    
        <p style={styles.hint}>
          Access is restricted to company employees.
          <br />Contact your admin if you need an account.
        </p>
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
    marginTop: '-56px', // offset navbar height since login has no navbar
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
  logoRow: {
    textAlign: 'center',
    marginBottom: '8px',
  },
  logo: {
    fontFamily: 'var(--font-mono)',
    fontSize: '24px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    letterSpacing: '0.05em',
  },
  logoAccent: {
    color: 'var(--accent)',
  },
  tagline: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
  },
  hint: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.7',
  },
};
