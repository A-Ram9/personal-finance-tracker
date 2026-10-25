import { summarise, expensesByCategory, inMonth, inPeriod, periodMonth, healthGrade, weeklyPace } from './summary';

const tx = (type, category, amount, date) => ({ type, category, amount, date });

describe('healthGrade', () => {
  test('no income gives no grade, even with spending', () => {
    expect(healthGrade(0, 0)).toBeNull();
    expect(healthGrade(0, 5000)).toBeNull();
  });

  test('spending exactly 90% of income is C', () => {
    expect(healthGrade(10000, 9000)).toBe('C');
  });

  test('spending exactly all of income is D, not F', () => {
    expect(healthGrade(10000, 10000)).toBe('D');
  });

  test('spending just over income is F', () => {
    expect(healthGrade(10000, 10001)).toBe('F');
  });

  test('spending 1.5 times income is F', () => {
    expect(healthGrade(10000, 15000)).toBe('F');
  });

  test('the lower bands', () => {
    expect(healthGrade(10000, 3000)).toBe('A+');
    expect(healthGrade(10000, 5000)).toBe('A');
    expect(healthGrade(10000, 7000)).toBe('B');
  });
});

describe('weeklyPace', () => {
  const now = new Date(2026, 9, 22, 15, 0); // 22 Oct 2026, mid-afternoon
  // An expense dated `n` days before `now`.
  const spent = (n, amount) => {
    const d = new Date(2026, 9, 22 - n);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return tx('expense', 'Food', amount, iso);
  };
  // `weeks` earlier weeks of `perWeek` each, one entry per week (days 7, 14, 21, ...).
  const history = (weeks, perWeek) => Array.from({ length: weeks }, (_, i) => spent(7 * (i + 1) + 6, perWeek));

  test('no entries: not enough history', () => {
    expect(weeklyPace([], now).status).toBe('not-enough-history');
  });

  test('only one earlier week: not enough history', () => {
    const result = weeklyPace([spent(0, 900), ...history(1, 1000)], now);
    expect(result.status).toBe('not-enough-history');
    expect(result.thisWeek).toBe(900);
  });

  test('two earlier weeks is enough', () => {
    expect(weeklyPace([spent(0, 1000), ...history(2, 1000)], now).status).toBe('steady');
  });

  test('exactly 25% above average is still steady', () => {
    expect(weeklyPace([spent(2, 1250), ...history(8, 1000)], now).status).toBe('steady');
  });

  test('more than 25% above average is busier', () => {
    const result = weeklyPace([spent(2, 1251), ...history(8, 1000)], now);
    expect(result.status).toBe('busier');
    expect(result.weeklyAverage).toBe(1000);
  });

  test('this week (days 0-6) is not counted in the average', () => {
    const result = weeklyPace([spent(0, 5000), spent(6, 5000), ...history(4, 1000)], now);
    expect(result.thisWeek).toBe(10000);
    expect(result.weeklyAverage).toBe(1000);
  });

  test('only the previous 8 weeks count; older spending is ignored', () => {
    const result = weeklyPace([...history(8, 1000), spent(70, 99999)], now);
    expect(result.weeksOfHistory).toBe(8);
    expect(result.weeklyAverage).toBe(1000);
  });

  test('averages over the weeks the records cover, not always 8', () => {
    const result = weeklyPace([spent(1, 100), ...history(3, 600)], now);
    expect(result.weeksOfHistory).toBe(3);
    expect(result.weeklyAverage).toBe(600);
  });

  test('income does not count as spending', () => {
    const result = weeklyPace([tx('income', 'Salary', 50000, '2026-10-21'), ...history(4, 1000)], now);
    expect(result.thisWeek).toBe(0);
    expect(result.status).toBe('steady');
  });
});

describe('inPeriod', () => {
  const list = [
    tx('expense', 'Sep 30', 1, '2026-09-30'),
    tx('expense', 'Oct 1', 1, '2026-10-01'),
    tx('expense', 'Oct 31', 1, '2026-10-31'),
    tx('expense', 'Nov 1', 1, '2026-11-01'),
  ];
  const names = (items) => items.map(t => t.category);

  test('this month runs from the 1st to the last day', () => {
    expect(names(inPeriod(list, 'this-month', new Date(2026, 9, 15)))).toEqual(['Oct 1', 'Oct 31']);
  });

  test('on 1 Oct, this month is October', () => {
    expect(names(inPeriod(list, 'this-month', new Date(2026, 9, 1, 0, 5)))).toEqual(['Oct 1', 'Oct 31']);
  });

  test('on 31 Oct late at night, this month is still October', () => {
    expect(names(inPeriod(list, 'this-month', new Date(2026, 9, 31, 23, 55)))).toEqual(['Oct 1', 'Oct 31']);
  });

  test('last month on 1 Nov is October', () => {
    expect(names(inPeriod(list, 'last-month', new Date(2026, 10, 1)))).toEqual(['Oct 1', 'Oct 31']);
  });

  test('last month on 31 Oct is September (no skipping past short months)', () => {
    expect(names(inPeriod(list, 'last-month', new Date(2026, 9, 31)))).toEqual(['Sep 30']);
  });

  test('last month in January is December of the year before', () => {
    const jan = new Date(2027, 0, 10);
    expect(periodMonth('last-month', jan)).toEqual(new Date(2026, 11, 1));
    expect(names(inPeriod([tx('expense', 'Dec', 1, '2026-12-24')], 'last-month', jan))).toEqual(['Dec']);
  });

  test('all time keeps everything', () => {
    expect(inPeriod(list, 'all-time', new Date(2026, 9, 15))).toEqual(list);
  });

  test('all time budgets against the current month', () => {
    expect(periodMonth('all-time', new Date(2026, 9, 15))).toEqual(new Date(2026, 9, 1));
  });
});

describe('inMonth', () => {
  const oct22 = new Date(2026, 9, 22);
  const list = [
    tx('expense', 'Rent', 15000, '2026-10-01'),
    tx('expense', 'Food', 800, '2026-10-31'),
    tx('expense', 'Travel', 4000, '2026-09-30'),
    tx('expense', 'Gift', 2000, '2025-10-15'),
    tx('expense', 'Books', 500, '2026-11-01'),
  ];

  test('keeps only the given calendar month, first to last day', () => {
    expect(inMonth(list, oct22).map(t => t.category)).toEqual(['Rent', 'Food']);
  });

  test('the same month in another year does not count', () => {
    expect(inMonth(list, oct22).some(t => t.category === 'Gift')).toBe(false);
  });

  test('a month with no entries gives an empty list', () => {
    expect(inMonth(list, new Date(2026, 0, 5))).toEqual([]);
  });

  test('works with summarise for this month\'s spending', () => {
    expect(summarise(inMonth(list, oct22)).expense).toBe(15800);
  });
});

describe('summarise', () => {
  test('an empty list gives all zeros', () => {
    expect(summarise([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });

  test('adds income and expenses separately', () => {
    const list = [tx('income', 'Salary', 50000), tx('expense', 'Food', 3000), tx('expense', 'Rent', 15000)];
    expect(summarise(list)).toEqual({ income: 50000, expense: 18000, balance: 32000 });
  });

  test('balance goes negative when spending exceeds income', () => {
    const list = [tx('income', 'Gift', 1000), tx('expense', 'Travel', 4000)];
    expect(summarise(list).balance).toBe(-3000);
  });
});

describe('expensesByCategory', () => {
  test('an empty list gives an empty array', () => {
    expect(expensesByCategory([])).toEqual([]);
  });

  test('ignores income such as Salary', () => {
    const list = [tx('income', 'Salary', 50000), tx('expense', 'Food', 3000)];
    expect(expensesByCategory(list)).toEqual([{ name: 'Food', value: 3000 }]);
  });

  test('adds up expenses in the same category, largest first', () => {
    const list = [
      tx('expense', 'Food', 1000),
      tx('expense', 'Rent', 15000),
      tx('expense', 'Food', 2500),
    ];
    expect(expensesByCategory(list)).toEqual([
      { name: 'Rent', value: 15000 },
      { name: 'Food', value: 3500 },
    ]);
  });
});
