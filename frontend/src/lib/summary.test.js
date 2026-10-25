import { summarise, expensesByCategory, inMonth } from './summary';

const tx = (type, category, amount, date) => ({ type, category, amount, date });

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
