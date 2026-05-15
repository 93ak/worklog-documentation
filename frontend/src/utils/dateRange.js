// ─────────────────────────────────────────────────────────────────────────────
// dateRange.js — Centralised date range utilities
// All dates are YYYY-MM-DD strings, consistent with backend.
// No timezone conversions: we use local date arithmetic throughout.
// ─────────────────────────────────────────────────────────────────────────────

/** Returns today as YYYY-MM-DD in local time */
export function todayStr() {
  const d = new Date();
  return localDateStr(d);
}

/** Converts a Date to YYYY-MM-DD in local time */
export function localDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Returns a date N days before `from` (default: today) as YYYY-MM-DD */
export function daysAgo(n, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return localDateStr(d);
}

/** Yesterday */
export function yesterday() {
  return daysAgo(1);
}

/** Start of the last 7 days range */
export function last7Start() {
  return daysAgo(6); // today minus 6 = 7 days inclusive
}

/**
 * Preset range definitions.
 * Each returns { start, end, label }.
 */
export const RANGE_PRESETS = {
  today: () => ({ label: 'Today', start: todayStr(), end: todayStr() }),
  yesterday: () => {
    const y = yesterday();
    return { label: 'Yesterday', start: y, end: y };
  },
  last7: () => ({ label: 'Last 7 Days', start: last7Start(), end: todayStr() }),
  custom: (start, end) => ({ label: 'Custom Range', start, end }),
};

/** Human-readable label for a range */
export function formatRangeLabel(start, end) {
  if (start === end) {
    if (start === todayStr()) return 'Today';
    if (start === yesterday()) return 'Yesterday';
    return formatDate(start);
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** Short date display: Apr 18 */
export function formatDate(dateStr) {
  // Parse without timezone shift: split the string
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Long date display: Monday, April 18, 2026 */
export function formatDateLong(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Parse a YYYY-MM-DD string into a local Date (no UTC shift) */
export function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Build query string for API calls: ?start=...&end=... */
export function buildDateQuery(start, end) {
  if (start === end) return `?start=${start}&end=${end}`;
  return `?start=${start}&end=${end}`;
}
