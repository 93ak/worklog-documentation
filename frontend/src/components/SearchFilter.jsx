// ─────────────────────────────────────────────────────────────────────────────
// SearchFilter.jsx — Reusable search + status filter bar
// Props:
//   search (string), onSearch (fn)
//   status ('all'|'submitted'|'missing'), onStatus (fn)
//   counts ({ all, submitted, missing })
//   placeholder (string, optional)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: '✓ Submitted' },
  { key: 'missing', label: '✗ Missing' },
];

export default function SearchFilter({ search, onSearch, status, onStatus, counts, placeholder }) {
  const inputRef = useRef(null);

  return (
    <div style={styles.wrap}>
      {/* Search input */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>⌕</span>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || 'Search employees…'}
          defaultValue={search}
          onChange={(e) => onSearch(e.target.value)}
          style={styles.searchInput}
        />
        {search && (
          <button
            style={styles.clearBtn}
            onClick={() => {
              onSearch('');
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div style={styles.tabs}>
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            style={{
              ...styles.tab,
              ...(status === t.key ? styles.tabActive : {}),
            }}
            onClick={() => onStatus(t.key)}
          >
            {t.label}
            {counts && (
              <span style={{
                ...styles.tabCount,
                ...(status === t.key ? styles.tabCountActive : {}),
              }}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    color: 'var(--text-muted)',
    fontSize: 16,
    pointerEvents: 'none',
    lineHeight: 1,
  },
  searchInput: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    padding: '6px 32px 6px 30px',
    width: 200,
    outline: 'none',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 0.15s ease',
  },
  clearBtn: {
    position: 'absolute',
    right: 8,
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
  },
  tabs: {
    display: 'flex',
    gap: 4,
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 11px',
    borderRadius: 'var(--radius)',
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-border)',
    color: 'var(--accent)',
  },
  tabCount: {
    background: 'var(--border)',
    color: 'var(--text-muted)',
    borderRadius: 99,
    fontSize: '10px',
    padding: '1px 5px',
    fontFamily: 'var(--font-mono)',
  },
  tabCountActive: {
    background: 'var(--accent-border)',
    color: 'var(--accent)',
  },
};
