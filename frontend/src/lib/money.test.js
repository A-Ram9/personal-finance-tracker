import { formatMoney } from './money';

// Intl separates the symbol from the digits with a non-breaking space for some currencies.
const plain = (text) => text.replace(/ /g, ' ').replace(/‎/g, '');

describe('formatMoney', () => {
  test('INR uses Indian grouping (lakhs) and 2 decimals', () => {
    expect(formatMoney(1234567.5, 'INR')).toBe('₹12,34,567.50');
  });

  test('USD uses thousands grouping', () => {
    expect(formatMoney(1234567.5, 'USD')).toBe('$1,234,567.50');
  });

  test('OMR shows 3 decimals', () => {
    expect(plain(formatMoney(12.5, 'OMR'))).toBe('ر.ع. 12.500');
  });

  test('negative amounts keep the minus sign in front', () => {
    expect(formatMoney(-500, 'INR')).toBe('-₹500.00');
  });

  test('bad input shows zero instead of NaN', () => {
    expect(formatMoney(undefined, 'INR')).toBe('₹0.00');
  });
});
