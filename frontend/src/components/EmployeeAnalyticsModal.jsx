// ─────────────────────────────────────────────────────────────────────────────
// EmployeeAnalyticsModal.jsx — Per-employee analytics dashboard modal
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { todayStr, formatDate, parseLocalDate } from '../utils/dateRange';

// Mini activity heatmap: last 10 weeks (70 days)
function MiniActivityGrid({ recentDates }) {
  const dateSet = new Set(recentDates);
  const today = todayStr();

  // Build 70 cells from 69 days ago to today
  const cells = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    cells.push({ dateStr: s, active: dateSet.has(s), isToday: s === today });
  }

  return (
    <div style={gridStyles.wrap}>
      <div style={gridStyles.grid}>
        {cells.map((cell) => (
          <div
            key={cell.dateStr}
            title={`${formatDate(cell.dateStr)}${cell.active ? ' — submitted' : ' — no log'}`}
            style={{
              ...gridStyles.cell,
              ...(cell.active ? gridStyles.cellActive : {}),
              ...(cell.isToday ? gridStyles.cellToday : {}),
            }}
          />
        ))}
      </div>
      <div style={gridStyles.legend}>
        <span style={{ ...gridStyles.legendDot, background: 'var(--border)' }} /> No log
        <span style={{ ...gridStyles.legendDot, background: 'var(--green)', marginLeft: 10 }} /> Submitted
      </div>
    </div>
  );
}

const gridStyles = {
  wrap: { marginTop: 4 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: 3,
  },
  cell: {
    aspectRatio: '1',
    borderRadius: 2,
    background: 'var(--border)',
  },
  cellActive: {
    background: 'var(--green)',
    opacity: 0.85,
  },
  cellToday: {
    outline: '1px solid var(--accent)',
    outlineOffset: 1,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  legendDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
};

export default function EmployeeAnalyticsModal({ employeeId, onClose }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getEmployeeAnalytics(employeeId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Trap scroll on background
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const emp = data?.employee;
  const name = emp ? (emp.displayName || emp.username) : '…';

  return (
    <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={styles.empRow}>
            <div style={styles.bigAvatar}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={styles.modalTitle}>{name}</div>
              {emp && (
                <div style={styles.modalSub} className="mono">
                  @{emp.username} · Employee Analytics
                </div>
              )}
            </div>
          </div>
          <div style={styles.headerActions}>
            {emp && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { onClose(); navigate(`/admin/employee/${employeeId}`); }}
              >
                View Calendar →
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ fontSize: 20, lineHeight: 1, padding: '4px 8px' }}
            >
              ×
            </button>
          </div>
        </div>

        <div className="divider" style={{ margin: '0 0 20px 0' }} />

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-center" style={{ padding: '48px 0' }}>
            <div className="spinner" />
            <span>Loading analytics…</span>
          </div>
        ) : data ? (
          <>
            {/* Key metrics */}
            <div style={styles.metricsGrid}>
              <MetricCard
                num={data.currentStreak}
                label="Current Streak"
                unit="days"
                color="var(--accent)"
                highlight
              />
              <MetricCard
                num={data.longestStreak}
                label="Longest Streak"
                unit="days"
                color="var(--blue)"
              />
              <MetricCard
                num={data.totalSubmissions}
                label="Total Logs"
                color="var(--text-primary)"
              />
              <MetricCard
                num={data.completionPct !== null ? `${data.completionPct}%` : '—'}
                label="Completion Rate"
                color={
                  data.completionPct >= 80 ? 'var(--green)'
                  : data.completionPct >= 50 ? 'var(--accent)'
                  : 'var(--red)'
                }
              />
              <MetricCard
                num={data.missedDays !== null ? data.missedDays : '—'}
                label="Missed Days"
                color="var(--red)"
              />
              <MetricCard
                num={data.lastSubmittedDate ? formatDate(data.lastSubmittedDate) : 'Never'}
                label="Last Submitted"
                color="var(--text-secondary)"
                mono
              />
            </div>

            {/* Activity calendar */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Activity — Last 70 Days</div>
              <MiniActivityGrid recentDates={data.recentDates} />
            </div>

            {/* Monthly breakdown */}
            {Object.keys(data.monthlyBreakdown).length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Monthly Breakdown</div>
                <MonthlyChart breakdown={data.monthlyBreakdown} />
              </div>
            )}

            {/* Edge case: never submitted */}
            {data.totalSubmissions === 0 && (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon">📭</div>
                <p>This employee has not submitted any logs yet.</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({ num, label, color, highlight, mono }) {
  return (
    <div style={{ ...metricStyles.card, ...(highlight ? metricStyles.highlight : {}) }}>
      <span style={{ ...metricStyles.num, color, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-mono)' }}>
        {num}
      </span>
      <span style={metricStyles.label}>{label}</span>
    </div>
  );
}

const metricStyles = {
  card: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  highlight: {
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-border)',
  },
  num: {
    fontFamily: 'var(--font-mono)',
    fontSize: '24px',
    fontWeight: '500',
    lineHeight: 1,
  },
  label: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
};

function MonthlyChart({ breakdown }) {
  const entries = Object.entries(breakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6); // last 6 months

  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div style={chartStyles.wrap}>
      {entries.map(([ym, count]) => {
        const [y, m] = ym.split('-');
        const label = new Date(Number(y), Number(m) - 1, 1)
          .toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const pct = Math.round((count / max) * 100);
        return (
          <div key={ym} style={chartStyles.col}>
            <span style={chartStyles.count}>{count}</span>
            <div style={chartStyles.barWrap}>
              <div style={{ ...chartStyles.bar, height: `${pct}%` }} />
            </div>
            <span style={chartStyles.label}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

const chartStyles = {
  wrap: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
    height: 90,
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    height: '100%',
    gap: 4,
  },
  count: {
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
  },
  barWrap: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    background: 'var(--border)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    background: 'var(--accent)',
    borderRadius: '3px 3px 0 0',
    transition: 'height 0.4s ease',
  },
  label: {
    fontSize: '9px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(2px)',
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
    width: '100%',
    maxWidth: 600,
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: 28,
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  empRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  bigAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-border)',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  modalSub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: 3,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: 10,
  },
};
