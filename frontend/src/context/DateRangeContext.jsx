// ─────────────────────────────────────────────────────────────────────────────
// DateRangeContext.jsx — Persistent date range state across navigation
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback } from 'react';
import { RANGE_PRESETS, todayStr } from '../utils/dateRange';

const DateRangeContext = createContext(null);

const defaultRange = RANGE_PRESETS.today();

export function DateRangeProvider({ children }) {
  const [preset, setPresetRaw] = useState('today');
  const [range, setRange] = useState(defaultRange);

  const applyPreset = useCallback((key) => {
    if (key === 'custom') return; // custom is set via applyCustom
    const r = RANGE_PRESETS[key]?.();
    if (r) {
      setPresetRaw(key);
      setRange(r);
    }
  }, []);

  const applyCustom = useCallback((start, end) => {
    setPresetRaw('custom');
    setRange(RANGE_PRESETS.custom(start, end));
  }, []);

  return (
    <DateRangeContext.Provider value={{ preset, range, applyPreset, applyCustom }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error('useDateRange must be used within DateRangeProvider');
  return ctx;
}
