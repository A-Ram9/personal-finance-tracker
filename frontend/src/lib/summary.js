// Pure functions for totals and groupings. No React, no API calls:
// the same transactions in always give the same answer out, which makes them easy to test.
// Amounts are in INR; components convert for display.

export function sumAmounts(transactions) {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export function summarise(transactions) {
  const income = sumAmounts(transactions.filter(t => t.type === 'income'));
  const expense = sumAmounts(transactions.filter(t => t.type === 'expense'));
  return { income, expense, balance: income - expense };
}

// Only the transactions dated in the same calendar month as `date` (default: this month).
// Dates are stored as 'YYYY-MM-DD', so comparing the 'YYYY-MM' prefix avoids time-zone surprises.
export function inMonth(transactions, date = new Date()) {
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return transactions.filter(t => String(t.date).startsWith(month));
}

export const PERIODS = ['this-month', 'last-month', 'all-time'];

// The calendar month a period is about. 'all-time' has no single month, so it falls back to
// this month (the budget uses this). Day 1 avoids rollover: 31 Mar minus one month is not 31 Feb.
export function periodMonth(period, now = new Date()) {
  if (period === 'last-month') return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// The transactions that belong to a dashboard period: 'this-month', 'last-month' or 'all-time'.
export function inPeriod(transactions, period, now = new Date()) {
  if (period === 'all-time') return transactions;
  return inMonth(transactions, periodMonth(period, now));
}

// Spending health grade from spending as a share of income.
// Returns null when there's no income, because there's no share to measure.
export function healthGrade(income, expense) {
  if (income <= 0) return null;
  const ratio = expense / income;
  if (ratio <= 0.3) return 'A+';
  if (ratio <= 0.5) return 'A';
  if (ratio <= 0.7) return 'B';
  if (ratio <= 0.9) return 'C';
  if (ratio <= 1) return 'D';
  return 'F';
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Whole days between a 'YYYY-MM-DD' date and today (0 = today, 1 = yesterday).
// Built from local calendar days so time zones and the time of day don't matter.
function daysAgo(isoDate, now) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - Date.UTC(y, m - 1, d)) / DAY_MS);
}

// "This week" = the last 7 days including today (days 0–6).
// It's compared with the average week across up to 8 earlier weeks (days 7–62), counting only
// weeks the records actually cover, so a newer account isn't averaged against empty weeks.
// Busier than usual = more than 25% above that average. Under 2 full weeks of history: no judgement.
export function weeklyPace(transactions, now = new Date()) {
  const dated = transactions
    .map(t => ({ ...t, ago: daysAgo(t.date, now) }))
    .filter(t => Number.isFinite(t.ago) && t.ago >= 0);

  const thisWeek = sumAmounts(dated.filter(t => t.type === 'expense' && t.ago <= 6));
  const oldest = dated.length ? Math.max(...dated.map(t => t.ago)) : -1;
  const weeksOfHistory = Math.min(8, Math.max(0, Math.floor((oldest - 6) / 7)));

  if (weeksOfHistory < 2) return { status: 'not-enough-history', thisWeek, weeklyAverage: null, weeksOfHistory };

  const earlier = dated.filter(t => t.type === 'expense' && t.ago >= 7 && t.ago < 7 + weeksOfHistory * 7);
  const weeklyAverage = sumAmounts(earlier) / weeksOfHistory;
  const status = thisWeek > weeklyAverage * 1.25 ? 'busier' : 'steady';
  return { status, thisWeek, weeklyAverage, weeksOfHistory };
}

// Returns [{ name, value }] with one entry per expense category, largest first.
// e.g. [{ name: 'Rent', value: 15000 }, { name: 'Food', value: 4200 }]
// Income is excluded on purpose (it used to leak into the chart as "Salary").
// IntelligencePanel relies on item [0] being the biggest category.
export function expensesByCategory(transactions) {
  const totals = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
