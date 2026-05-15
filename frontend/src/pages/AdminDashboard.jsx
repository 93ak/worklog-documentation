// ─────────────────────────────────────────────────────────────────────────────
// AdminDashboard.jsx — Team overview with date range, drill-down, analytics
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { useDateRange } from '../context/DateRangeContext';
import { useFilter } from '../hooks/useFilter';
import { formatRangeLabel, todayStr } from '../utils/dateRange';
import DateRangePicker from '../components/DateRangePicker';
import SearchFilter from '../components/SearchFilter';
import DayDrillDown from '../components/DayDrillDown';
import EmployeeAnalyticsModal from '../components/EmployeeAnalyticsModal';
import MyLogPanel from '../components/MyLogPanel';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { range } = useDateRange();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drill-down: selected date for day detail panel
  const [drillDate, setDrillDate] = useState(null);

  // Analytics modal
  const [analyticsId, setAnalyticsId] = useState(null);

  // ── Fetch overview whenever date range changes ─────────────────────────────
  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getOverview({ start: range.start, end: range.end });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, [range.start, range.end]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // ── Employee list + filter ─────────────────────────────────────────────────
  const employees = data?.employees || [];
  const { search, setSearch, status, setStatus, filtered, counts } = useFilter(employees);

  const submittedCount = counts.submitted;
  const submittedPct = employees.length
    ? Math.round((submittedCount / employees.length) * 100)
    : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleEmployeeClick(empId) {
    setAnalyticsId(empId);
  }

  function handleDrillClose() {
    setDrillDate(null);
  }

  const isSingleDay = range.start === range.end;
  const rangeLabel = formatRangeLabel(range.start, range.end);

  return (
    <>
      {/* Analytics modal */}
      {analyticsId && (
        <EmployeeAnalyticsModal
          employeeId={analyticsId}
          onClose={() => setAnalyticsId(null)}
        />
      )}

      {/* Page header with date range picker */}
      <div style={styles.pageTop}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Team Overview</h1>
          <p className="mono">{rangeLabel} — Submission status</p>
        </div>
        <DateRangePicker />
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

      {/* Summary cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNum}>{employees.length}</span>
          <span style={styles.summaryLabel}>Total employees</span>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: 'rgba(61,214,140,0.3)' }}>
          <span style={{ ...styles.summaryNum, color: 'var(--green)' }}>{submittedCount}</span>
          <span style={styles.summaryLabel}>Submitted</span>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: 'rgba(247,111,111,0.3)' }}>
          <span style={{ ...styles.summaryNum, color: 'var(--red)' }}>{counts.missing}</span>
          <span style={styles.summaryLabel}>Not submitted</span>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: 'rgba(245,166,35,0.3)' }}>
          <span style={{ ...styles.summaryNum, color: 'var(--accent)' }}>{submittedPct}%</span>
          <span style={styles.summaryLabel}>Completion rate</span>
        </div>
      </div>

      {/* Progress bar */}
      {employees.length > 0 && (
        <div style={styles.progressWrap}>
          <div style={{ ...styles.progressBar, width: `${submittedPct}%` }} />
        </div>
      )}

      {/* Main layout: table + optional drill-down panel + my log panel */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Employee table */}
        <div className="card" style={{ flex: 1, minWidth: 0 }}>
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="card-title">Employees</div>
              <div className="card-subtitle">
                {isSingleDay
                  ? 'Click a row to open analytics · Click a date on the calendar for drill-down'
                  : `Showing any submission within ${rangeLabel}`}
              </div>
            </div>
            <SearchFilter
              search={search}
              onSearch={setSearch}
              status={status}
              onStatus={setStatus}
              counts={counts}
            />
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
              <span>Loading team data…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>No employees found for this filter.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Username</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr
                      key={emp._id}
                      onClick={() => handleEmployeeClick(emp._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={styles.empName}>
                          <div style={styles.avatar}>
                            {(emp.displayName || emp.username).charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-500">
                            {emp.displayName || emp.username}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="mono text-secondary" style={{ fontSize: 12 }}>
                          {emp.username}
                        </span>
                      </td>
                      <td>
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
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/employee/${emp._id}`);
                            }}
                          >
                            Calendar
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmployeeClick(emp._id);
                            }}
                          >
                            Analytics
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Today drill-down shortcut — only when single day selected */}
          {isSingleDay && !loading && (
            <div style={styles.drillShortcut}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDrillDate(range.start)}
                style={{ fontSize: '12px', color: 'var(--accent)' }}
              >
                📅 View {range.start === todayStr() ? "today's" : rangeLabel} submission detail
              </button>
            </div>
          )}
        </div>

        {/* Day drill-down panel */}
        {drillDate && (
          <DayDrillDown
            date={drillDate}
            onClose={handleDrillClose}
            onEmployeeClick={(id) => {
              handleDrillClose();
              setAnalyticsId(id);
            }}
          />
        )}

        {/* Admin's own log panel */}
        <MyLogPanel />
      </div>
    </>
  );
}

const styles = {
  pageTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
    flexWrap: 'wrap',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 16,
  },
  summaryCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  summaryNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '28px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: 'var(--font-mono)',
  },
  progressWrap: {
    height: 4,
    background: 'var(--border)',
    borderRadius: 99,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'var(--green)',
    borderRadius: 99,
    transition: 'width 0.6s ease',
  },
  empName: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-border)',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  drillShortcut: {
    borderTop: '1px solid var(--border)',
    padding: '12px 0 0 0',
    marginTop: 16,
    textAlign: 'center',
  },
};