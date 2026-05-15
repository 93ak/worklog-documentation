// ─────────────────────────────────────────────────────────────────────────────
// MyLogPanel.jsx — Compact log submission widget for admin sidebar
// Reuses LogCard + LogEditor, same logic as EmployeeDashboard
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { logsAPI } from '../utils/api';
import LogCard from './LogCard';
import LogEditor from './LogEditor';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function MyLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const today = getTodayStr();
  const todayLog = logs.find((l) => l.date === today);
  const thisMonthLogs = logs.filter((l) => l.date.startsWith(today.slice(0, 7))).length;

  const fetchLogs = useCallback(async () => {
    try {
      const data = await logsAPI.getMyLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to load your logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  async function handleCreate(content) {
    const newLog = await logsAPI.createLog(today, content);
    setLogs((prev) => [newLog, ...prev]);
    setShowForm(false);
    flash('Log saved ✓');
  }

  async function handleUpdate(id, content) {
    const updated = await logsAPI.updateLog(id, content);
    setLogs((prev) => prev.map((l) => (l._id === id ? updated : l)));
    flash('Log updated ✓');
  }

  function flash(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>My Log</div>
          <div style={styles.sub} className="mono">{today}</div>
        </div>
        <div style={styles.statusBadge}>
          {todayLog ? (
            <span className="badge badge-green">
              <span className="status-dot green" />
              Logged
            </span>
          ) : (
            <span className="badge badge-red">
              <span className="status-dot red" />
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Mini stats */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={styles.statNum}>{logs.length}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statNum}>{thisMonthLogs}</span>
          <span style={styles.statLabel}>This month</span>
        </div>
      </div>

      <div style={styles.divider} />

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: 10 }}>{successMsg}</div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 10 }}>{error}</div>
      )}

      {/* Today's log area */}
      {loading ? (
        <div className="loading-center" style={{ padding: '24px 0' }}>
          <div className="spinner" />
          <span>Loading…</span>
        </div>
      ) : showForm && !todayLog ? (
        <LogEditor
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
          label="Submit log"
        />
      ) : todayLog ? (
        <LogCard log={todayLog} onUpdate={handleUpdate} />
      ) : (
        <div style={styles.empty}>
          <span style={{ fontSize: 24, opacity: 0.4 }}>📋</span>
          <p style={styles.emptyText}>No log for today yet.</p>
          <button
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
            onClick={() => setShowForm(true)}
          >
            + Add today's log
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    width: 280,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignSelf: 'flex-start',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  sub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  statusBadge: {
    flexShrink: 0,
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg)',
    borderRadius: 'var(--radius)',
    padding: '10px 16px',
    gap: 0,
  },
  stat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  },
  statNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--accent)',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: 'var(--font-mono)',
  },
  statDivider: {
    width: 1,
    height: 28,
    background: 'var(--border)',
    margin: '0 12px',
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '0 -4px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '16px 0 8px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: 0,
  },
};