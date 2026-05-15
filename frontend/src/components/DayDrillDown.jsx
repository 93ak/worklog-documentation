// ─────────────────────────────────────────────────────────────────────────────
// DayDrillDown.jsx — Slide-in panel showing submission details for a given date
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../utils/api';
import { formatDateLong } from '../utils/dateRange';
import SearchFilter from './SearchFilter';
import { useFilter } from '../hooks/useFilter';

export default function DayDrillDown({ date, onClose, onEmployeeClick }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getDayDrillDown(date);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load day data');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetch(); }, [fetch]);

  // Normalise for useFilter: submitted employees have submittedToday=true
  const allEmployees = data
    ? [
        ...data.submitted.map((e) => ({ ...e, submittedToday: true })),
        ...data.missing.map((e) => ({ ...e, submittedToday: false })),
      ]
    : [];

  const { search, setSearch, status, setStatus, filtered, counts } = useFilter(allEmployees);

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>{formatDateLong(date)}</div>
          <div style={styles.headerSub} className="mono">{date}</div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ fontSize: 18, lineHeight: 1, padding: '4px 8px' }}
        >
          ×
        </button>
      </div>

      {/* Stat cards */}
      {data && !loading && (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={{ ...styles.statNum, color: 'var(--accent)' }}>
              {data.completionPct}%
            </span>
            <span style={styles.statLabel}>Completion</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statNum, color: 'var(--green)' }}>
              {data.submittedCount}
            </span>
            <span style={styles.statLabel}>Submitted</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statNum, color: 'var(--red)' }}>
              {data.missingCount}
            </span>
            <span style={styles.statLabel}>Missing</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {data && data.total > 0 && (
        <div style={styles.progressWrap}>
          <div style={{ ...styles.progressBar, width: `${data.completionPct}%` }} />
        </div>
      )}

      {error && <div className="alert alert-error" style={{ margin: '12px 0' }}>{error}</div>}

      {loading ? (
        <div className="loading-center" style={{ padding: '40px 0' }}>
          <div className="spinner" />
          <span>Loading…</span>
        </div>
      ) : (
        <>
          {/* Search + filter */}
          {allEmployees.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <SearchFilter
                search={search}
                onSearch={setSearch}
                status={status}
                onStatus={setStatus}
                counts={counts}
                placeholder="Search employees…"
              />
            </div>
          )}

          {/* Employee list */}
          <div style={styles.listWrap}>
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-icon">👥</div>
                <p>No employees match your filter.</p>
              </div>
            ) : (
              filtered.map((emp) => (
                <div
                  key={emp._id}
                  style={styles.empRow}
                  onClick={() => onEmployeeClick && onEmployeeClick(emp._id)}
                >
                  <div style={styles.avatar}>
                    {(emp.displayName || emp.username).charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.empInfo}>
                    <span style={styles.empName}>
                      {emp.displayName || emp.username}
                    </span>
                    <span style={styles.empUsername} className="mono">
                      @{emp.username}
                    </span>
                  </div>
                  <div style={styles.empStatus}>
                    {emp.submittedToday ? (
                      <span className="badge badge-green">
                        <span className="status-dot green" />
                        Submitted
                      </span>
                    ) : (
                      <span className="badge badge-red">
                        <span className="status-dot red" />
                        Missing
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
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
    width: 340,
    flexShrink: 0,
    maxHeight: 'calc(100vh - 160px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 12,
    borderBottom: '1px solid var(--border)',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: 1.4,
  },
  headerSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: 3,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  statCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  },
  statNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '20px',
    fontWeight: '500',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  progressWrap: {
    height: 3,
    background: 'var(--border)',
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    background: 'var(--green)',
    borderRadius: 99,
    transition: 'width 0.5s ease',
  },
  listWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  empRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 10px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'background 0.1s ease',
    border: '1px solid transparent',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-border)',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  empInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  empName: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  empUsername: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  empStatus: {
    flexShrink: 0,
  },
};
