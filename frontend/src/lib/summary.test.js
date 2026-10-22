import { summarise, expensesByCategory } from './summary';

const tx = (type, category, amount) => ({ type, category, amount });

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
