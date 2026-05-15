// ─────────────────────────────────────────────────────────────────────────────
// useFilter.js — Reusable search + status filter hook
// Works with any list of employees that have { displayName, username, submittedToday }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback, useRef } from 'react';

/**
 * @param {Array} employees - list of employee objects
 * @returns {Object} { search, setSearch, status, setStatus, filtered, counts }
 */
export function useFilter(employees = []) {
  const [search, setSearchRaw] = useState('');
  const [status, setStatus] = useState('all'); // 'all' | 'submitted' | 'missing'
  const debounceRef = useRef(null);

  // Debounced search setter
  const setSearch = useCallback((val) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchRaw(val), 150);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees.filter((emp) => {
      // Status filter
      if (status === 'submitted' && !emp.submittedToday) return false;
      if (status === 'missing' && emp.submittedToday) return false;

      // Search filter (case-insensitive, name or username)
      if (q) {
        const name = (emp.displayName || '').toLowerCase();
        const uname = (emp.username || '').toLowerCase();
        if (!name.includes(q) && !uname.includes(q)) return false;
      }

      return true;
    });
  }, [employees, search, status]);

  const counts = useMemo(() => ({
    all: employees.length,
    submitted: employees.filter((e) => e.submittedToday).length,
    missing: employees.filter((e) => !e.submittedToday).length,
  }), [employees]);

  return { search, setSearch, status, setStatus, filtered, counts };
}
