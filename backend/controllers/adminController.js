const User = require('../models/User');
const Log = require('../models/Log');

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Count Mon–Fri days between two YYYY-MM-DD strings (inclusive).
 */
function countWorkingDays(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function computeCurrentStreak(sortedDescDates, anchor) {
  if (!sortedDescDates.length) return 0;
  let streak = 0;
  let cursor = anchor || todayStr();
  for (const date of sortedDescDates) {
    if (date === cursor) {
      streak++;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().split('T')[0];
    } else if (date < cursor) {
      break;
    }
  }
  return streak;
}

function computeLongestStreak(sortedDescDates) {
  if (!sortedDescDates.length) return 0;
  const asc = [...sortedDescDates].sort();
  let longest = 1, current = 1;
  for (let i = 1; i < asc.length; i++) {
    const prev = new Date(asc[i - 1]);
    const curr = new Date(asc[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

// ── GET /api/admin/overview ───────────────────────────────────────────────────
// Accepts optional ?start=YYYY-MM-DD&end=YYYY-MM-DD query params.
exports.getOverview = async (req, res) => {
  try {
    const end = req.query.end || todayStr();
    const start = req.query.start || end;

    const employees = await User.find({})
      .select('_id username displayName createdAt')
      .lean();

    const logs = await Log.find({ date: { $gte: start, $lte: end } })
      .select('userId date')
      .lean();

    const submittedIds = new Set(logs.map((l) => l.userId.toString()));

    const overview = employees.map((emp) => ({
      ...emp,
      submittedToday: submittedIds.has(emp._id.toString()),
    }));

    res.json({ start, end, employees: overview });
  } catch (err) {
    console.error('getOverview error:', err);
    res.status(500).json({ message: 'Failed to fetch overview' });
  }
};

// ── GET /api/admin/user/:id/logs ──────────────────────────────────────────────
exports.getUserLogs = async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id })
      .select('-password')
      .lean();

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const logs = await Log.find({ userId: req.params.id })
      .sort({ date: -1 })
      .lean();

    res.json({ employee, logs });
  } catch (err) {
    console.error('getUserLogs error:', err);
    res.status(500).json({ message: 'Failed to fetch employee logs' });
  }
};

// ── GET /api/admin/day/:date ──────────────────────────────────────────────────
exports.getDayDrillDown = async (req, res) => {
  try {
    const { date } = req.params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
    }

    const employees = await User.find({})
      .select('_id username displayName')
      .lean();

    const logs = await Log.find({ date })
      .select('userId content createdAt updatedAt')
      .lean();

    const logMap = {};
    logs.forEach((l) => {
      logMap[l.userId.toString()] = l;
    });

    const submitted = [];
    const missing = [];

    employees.forEach((emp) => {
      const log = logMap[emp._id.toString()];
      if (log) {
        submitted.push({ ...emp, log });
      } else {
        missing.push(emp);
      }
    });

    const total = employees.length;
    const submittedCount = submitted.length;
    const completionPct = total ? Math.round((submittedCount / total) * 100) : 0;

    res.json({
      date,
      total,
      submittedCount,
      missingCount: missing.length,
      completionPct,
      submitted,
      missing,
    });
  } catch (err) {
    console.error('getDayDrillDown error:', err);
    res.status(500).json({ message: 'Failed to fetch day data' });
  }
};

// ── GET /api/admin/user/:id/analytics ────────────────────────────────────────
exports.getEmployeeAnalytics = async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id })
      .select('-password')
      .lean();

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const allLogs = await Log.find({ userId: req.params.id })
      .select('date createdAt')
      .sort({ date: -1 })
      .lean();

    const dateSortedDesc = allLogs.map((l) => l.date);
    const today = todayStr();

    const currentStreak = computeCurrentStreak(dateSortedDesc, today);
    const longestStreak = computeLongestStreak(dateSortedDesc);
    const totalSubmissions = allLogs.length;
    const lastSubmittedDate = dateSortedDesc[0] || null;

    let missedDays = null;
    let completionPct = null;

    // Completion rate and missed days are scoped to the current calendar month
    const monthStart = today.slice(0, 7) + '-01'; // YYYY-MM-01
    const workingDaysThisMonth = countWorkingDays(monthStart, today);

    const monthSubmissions = allLogs.filter((l) => {
      if (!l.date.startsWith(today.slice(0, 7))) return false;
      const [y, m, d] = l.date.split('-').map(Number);
      const day = new Date(y, m - 1, d).getDay();
      return day !== 0 && day !== 6; // exclude weekend submissions from count
    }).length;

    missedDays = Math.max(0, workingDaysThisMonth - monthSubmissions);
    completionPct = workingDaysThisMonth > 0
      ? Math.min(100, Math.round((monthSubmissions / workingDaysThisMonth) * 100))
      : 0;

    // Recent 60 log dates for mini activity calendar
    const recentDates = dateSortedDesc.slice(0, 60);

    // Monthly breakdown
    const monthlyBreakdown = {};
    allLogs.forEach((l) => {
      const ym = l.date.slice(0, 7);
      monthlyBreakdown[ym] = (monthlyBreakdown[ym] || 0) + 1;
    });

    res.json({
      employee,
      currentStreak,
      longestStreak,
      totalSubmissions,
      missedDays,
      completionPct,
      lastSubmittedDate,
      recentDates,
      monthlyBreakdown,
    });
  } catch (err) {
    console.error('getEmployeeAnalytics error:', err);
    res.status(500).json({ message: 'Failed to fetch employee analytics' });
  }
};