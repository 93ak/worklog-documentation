// ─────────────────────────────────────────────────────────────────────────────
// CalendarView.jsx — Per-employee log calendar with analytics modal access
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import EmployeeAnalyticsModal from '../components/EmployeeAnalyticsModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserLogs(id);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load employee logs');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const logMap = {};
  if (data?.logs) {
    data.logs.forEach((l) => { logMap[l.date] = l; });
  }

  const cells = buildCalendarGrid(year, month);
  const today = new Date().toISOString().split('T')[0];

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  function handleDayClick(day) {
    if (!day) return;
    const dateStr = toDateStr(year, month, day);
    const log = logMap[dateStr];
    if (log) setSelectedDay({ dateStr, log });
  }

  const employee = data?.employee;
  const totalLogs = data?.logs?.length || 0;
  const monthLogs = data?.logs?.filter(
    (l) => l.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  ).length || 0;

  return (
    <>
      {showAnalytics && (
        <EmployeeAnalyticsModal
          employeeId={id}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      <div style={styles.backRow}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>
          ← Back to dashboard
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>
            {loading ? 'Loading…' : (employee?.displayName || employee?.username || 'Employee')}
          </h1>
          <p>
            {employee?.username && (
              <span className="mono">@{employee.username} · </span>
            )}
            Log calendar view
          </p>
        </div>
        {!loading && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAnalytics(true)}
          >
            📊 Analytics
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
          <span>Loading logs…</span>
        </div>
      ) : (
        <div style={styles.layout}>
          {/* Calendar */}
          <div className="card" style={{ flex: 1 }}>
            <div style={styles.monthNav}>
              <button className="btn btn-ghost btn-sm" onClick={prevMonth}>‹</button>
              <span style={styles.monthLabel}>{MONTHS[month]} {year}</span>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth}>›</button>
            </div>

            <div style={styles.statsStrip}>
              <span style={styles.stripItem}>
                <span style={styles.stripNum}>{monthLogs}</span>
                <span style={styles.stripLabel}>this month</span>
              </span>
              <span style={styles.stripDivider} />
              <span style={styles.stripItem}>
                <span style={styles.stripNum}>{totalLogs}</span>
                <span style={styles.stripLabel}>all time</span>
              </span>
            </div>

            <div style={styles.calGrid}>
              {DAYS.map((d) => (
                <div key={d} style={styles.dayHeader}>{d}</div>
              ))}
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = toDateStr(year, month, day);
                const log = logMap[dateStr];
                const isToday = dateStr === today;
                const isSelected = selectedDay?.dateStr === dateStr;
                const isFuture = dateStr > today;

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDayClick(day)}
                    style={{
                      ...styles.cell,
                      ...(log ? styles.cellLogged : {}),
                      ...(isToday ? styles.cellToday : {}),
                      ...(isSelected ? styles.cellSelected : {}),
                      ...(isFuture ? styles.cellFuture : {}),
                      cursor: log ? 'pointer' : 'default',
                    }}
                    title={log ? 'Click to view log' : isFuture ? '' : 'No log submitted'}
                  >
                    <span style={styles.cellNum}>{day}</span>
                    {log && <span style={styles.cellDot} />}
                  </div>
                );
              })}
            </div>

            <div style={styles.legend}>
              <span style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: 'var(--green)' }} />
                Log submitted
              </span>
              <span style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: 'var(--border-light)' }} />
                No log
              </span>
              <span style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: 'var(--accent)', borderRadius: 2 }} />
                Today
              </span>
            </div>
          </div>

          {/* Log detail panel */}
          <div style={styles.detailPanel}>
            {selectedDay ? (
              <div className="card" style={{ height: '100%' }}>
                <div className="card-header" style={{ marginBottom: 12 }}>
                  <div>
                    <div className="card-title" style={{ fontSize: 13 }}>
                      {new Date(
                        ...selectedDay.dateStr.split('-').map((n, i) => i === 1 ? +n - 1 : +n)
                      ).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </div>
                    <div className="card-subtitle">{selectedDay.dateStr}</div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedDay(null)}
                    style={{ fontSize: 16, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
                <div className="divider" style={{ margin: '0 0 16px 0' }} />
                <p style={styles.logContent}>{selectedDay.log.content}</p>
                {new Date(selectedDay.log.updatedAt) - new Date(selectedDay.log.createdAt) > 2000 && (
                  <p style={styles.editedNote}>
                    ✎ Edited on {new Date(selectedDay.log.updatedAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            ) : (
              <div style={styles.detailEmpty}>
                <span style={{ fontSize: 28, opacity: 0.3 }}>📅</span>
                <p>Click a highlighted day<br />to view the log entry</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  backRow: { marginBottom: 16 },
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthLabel: { fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
  statsStrip: { display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: 20 },
  stripItem: { display: 'flex', alignItems: 'baseline', gap: 6 },
  stripNum: { fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '500', color: 'var(--accent)' },
  stripLabel: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  stripDivider: { width: 1, height: 20, background: 'var(--border)' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 },
  dayHeader: { textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0 8px 0' },
  cell: { aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'var(--bg)', border: '1px solid transparent', position: 'relative', transition: 'all 0.1s ease', gap: 2 },
  cellLogged: { background: 'var(--green-dim)', border: '1px solid rgba(61,214,140,0.25)' },
  cellToday: { border: '1px solid var(--accent)', background: 'var(--accent-dim)' },
  cellSelected: { border: '1px solid var(--blue)', background: 'var(--blue-dim)' },
  cellFuture: { opacity: 0.3 },
  cellNum: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' },
  cellDot: { width: 4, height: 4, borderRadius: '50%', background: 'var(--green)' },
  legend: { display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  legendDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  detailPanel: { width: 280, flexShrink: 0, minHeight: 200 },
  detailEmpty: { height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', lineHeight: '1.6', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 },
  logContent: { fontSize: '13px', lineHeight: '1.75', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' },
  editedNote: { marginTop: 12, fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
};
