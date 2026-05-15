// ─────────────────────────────────────────────────────────────────────────────
// DateRangePicker.jsx — Date range selector integrated into dashboard header
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import { useDateRange } from '../context/DateRangeContext';
import { formatRangeLabel, todayStr } from '../utils/dateRange';

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'custom', label: 'Custom Range' },
];

export default function DateRangePicker() {
  const { preset, range, applyPreset, applyCustom } = useDateRange();
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(range.start);
  const [customEnd, setCustomEnd] = useState(range.end);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowCustom(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handlePresetClick(key) {
    if (key === 'custom') {
      setShowCustom(true);
      return;
    }
    applyPreset(key);
    setOpen(false);
    setShowCustom(false);
  }

  function handleCustomApply() {
    if (!customStart || !customEnd) return;
    const start = customStart <= customEnd ? customStart : customEnd;
    const end = customStart <= customEnd ? customEnd : customStart;
    applyCustom(start, end);
    setOpen(false);
    setShowCustom(false);
  }

  const displayLabel = formatRangeLabel(range.start, range.end);

  return (
    <div style={styles.wrap} ref={ref}>
      <button
        className="btn btn-secondary btn-sm"
        style={styles.trigger}
        onClick={() => { setOpen((o) => !o); setShowCustom(false); }}
      >
        <span style={styles.calIcon}>📅</span>
        <span style={styles.label}>{displayLabel}</span>
        <span style={{ ...styles.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div style={styles.dropdown}>
          {!showCustom ? (
            <>
              <div style={styles.dropHeader}>Date Range</div>
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  style={{
                    ...styles.presetBtn,
                    ...(preset === p.key && !showCustom ? styles.presetActive : {}),
                  }}
                  onClick={() => handlePresetClick(p.key)}
                >
                  {p.label}
                  {preset === p.key && <span style={styles.checkMark}>✓</span>}
                </button>
              ))}
            </>
          ) : (
            <div style={styles.customForm}>
              <div style={styles.dropHeader}>Custom Range</div>
              <div style={styles.customRow}>
                <div style={styles.customField}>
                  <label style={styles.customLabel}>From</label>
                  <input
                    type="date"
                    value={customStart}
                    max={todayStr()}
                    onChange={(e) => setCustomStart(e.target.value)}
                    style={styles.dateInput}
                  />
                </div>
                <div style={styles.customField}>
                  <label style={styles.customLabel}>To</label>
                  <input
                    type="date"
                    value={customEnd}
                    max={todayStr()}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    style={styles.dateInput}
                  />
                </div>
              </div>
              <div style={styles.customActions}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowCustom(false)}
                >
                  ← Back
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    position: 'relative',
    display: 'inline-block',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    minWidth: 160,
  },
  calIcon: {
    fontSize: 13,
    lineHeight: 1,
  },
  label: {
    flex: 1,
    textAlign: 'left',
  },
  chevron: {
    fontSize: 10,
    transition: 'transform 0.15s ease',
    color: 'var(--text-muted)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    minWidth: 200,
    zIndex: 200,
    overflow: 'hidden',
  },
  dropHeader: {
    padding: '10px 14px 6px',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    borderBottom: '1px solid var(--border)',
  },
  presetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 14px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.1s ease',
    borderBottom: '1px solid var(--border)',
  },
  presetActive: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
  },
  checkMark: {
    color: 'var(--green)',
    fontSize: '12px',
  },
  customForm: {
    padding: 0,
  },
  customRow: {
    display: 'flex',
    gap: 10,
    padding: '12px 14px 8px',
  },
  customField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  customLabel: {
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  dateInput: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text-primary)',
    fontSize: '12px',
    padding: '6px 8px',
    width: '100%',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    colorScheme: 'dark',
  },
  customActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 14px 12px',
    gap: 8,
  },
};
