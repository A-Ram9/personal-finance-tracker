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
