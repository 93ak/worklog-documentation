// ─────────────────────────────────────────────────────────────────────────────
// api.js — centralised Axios-free fetch wrapper
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE =
  (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';
function getToken() {
  return localStorage.getItem('wl_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),
  requestReset: (email) =>
    request('/auth/request-reset', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};

// ── Logs ──────────────────────────────────────────────────────────────────────
export const logsAPI = {
  getMyLogs: () => request('/logs/me'),
  createLog: (date, content) =>
    request('/logs', { method: 'POST', body: JSON.stringify({ date, content }) }),
  updateLog: (id, content) =>
    request(`/logs/${id}`, { method: 'PUT', body: JSON.stringify({ content }) }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  /**
   * Fetch overview. Accepts optional { start, end } date range strings.
   * Defaults to today on the backend.
   */
  getOverview: ({ start, end } = {}) => {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/admin/overview${qs}`);
  },

  /** Full log list for CalendarView */
  getUserLogs: (userId) => request(`/admin/user/${userId}/logs`),

  /** Drill-down for a specific YYYY-MM-DD date */
  getDayDrillDown: (date) => request(`/admin/day/${date}`),

  /** Per-employee analytics */
  getEmployeeAnalytics: (userId) => request(`/admin/user/${userId}/analytics`),
};
