import { partOfDay, formatDate } from './dates';

describe('partOfDay', () => {
  const at = (hour) => new Date(2026, 9, 22, hour, 30);

  test('morning before noon', () => {
    expect(partOfDay(at(0))).toBe('morning');
    expect(partOfDay(at(11))).toBe('morning');
  });

  test('afternoon from noon until 5pm', () => {
    expect(partOfDay(at(12))).toBe('afternoon');
    expect(partOfDay(at(16))).toBe('afternoon');
  });

  test('evening from 5pm', () => {
    expect(partOfDay(at(17))).toBe('evening');
    expect(partOfDay(at(23))).toBe('evening');
  });
});

describe('formatDate', () => {
  test('shows day, short month and year', () => {
    expect(formatDate('2026-10-22')).toBe('22 Oct 2026');
  });

  test('every month is three letters, including Sep', () => {
    const months = Array.from({ length: 12 }, (_, i) => formatDate(`2026-${String(i + 1).padStart(2, '0')}-15`).split(' ')[1]);
    expect(months).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
  });

  test('does not slip to the previous day', () => {
    expect(formatDate('2026-01-01')).toBe('1 Jan 2026');
  });

  test('leaves anything unexpected as it was', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate('not a date')).toBe('not a date');
  });
});
