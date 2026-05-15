import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { logsAPI } from '../utils/api';
import LogCard from '../components/LogCard';
import LogEditor from '../components/LogEditor';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const today = getTodayStr();
  const todayLog = logs.find((l) => l.date === today);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await logsAPI.getMyLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function handleCreate(content) {
    const newLog = await logsAPI.createLog(today, content);
    setLogs((prev) => [newLog, ...prev]);
    setShowNewForm(false);
    flash('Log saved for today ✓');
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

  const totalLogs = logs.length;
  const thisMonthLogs = logs.filter((l) => l.date.startsWith(today.slice(0, 7))).length;

  return (
    <>
      <div className="page-header">
        <h1>My Work Log</h1>
        <p>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={styles.statVal}>{totalLogs}</span>
          <span style={styles.statLabel}>Total entries</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statVal}>{thisMonthLogs}</span>
          <span style={styles.statLabel}>This month</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statVal} style={{ color: todayLog ? 'var(--green)' : 'var(--red)' }}>
            {todayLog ? '✓' : '✗'}
          </span>
          <span style={styles.statLabel}>Today logged</span>
        </div>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Today's log section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Today's Log</div>
            <div className="card-subtitle">{today}</div>
          </div>
          {!todayLog && !showNewForm && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowNewForm(true)}>
              + Add log
            </button>
          )}
        </div>

        {showNewForm && !todayLog ? (
          <LogEditor
            onSave={handleCreate}
            onCancel={() => setShowNewForm(false)}
            label="Submit today's log"
          />
        ) : todayLog ? (
          <LogCard log={todayLog} onUpdate={handleUpdate} />
        ) : (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-icon">📋</div>
            <p>No log submitted for today yet.</p>
          </div>
        )}
      </div>

      {/* Previous logs */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Previous Logs</div>
            <div className="card-subtitle">{totalLogs} total entries</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
            <span>Loading logs…</span>
          </div>
        ) : logs.filter((l) => l.date !== today).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗂</div>
            <p>No previous logs found.</p>
          </div>
        ) : (
          <div style={styles.logList}>
            {logs
              .filter((l) => l.date !== today)
              .map((log) => (
                <LogCard key={log._id} log={log} onUpdate={handleUpdate} />
              ))}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px 28px',
    marginBottom: 24,
    gap: 0,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  statVal: {
    fontFamily: 'var(--font-mono)',
    fontSize: '22px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: 'var(--font-mono)',
  },
  statDivider: {
    width: 1,
    height: 36,
    background: 'var(--border)',
    margin: '0 16px',
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
};
