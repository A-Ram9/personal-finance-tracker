// One place that turns a number into displayed money.
// Intl.NumberFormat knows each currency's grouping and decimals (OMR has 3, the rest 2);
// we only swap in the symbols the currency picker shows.
const LOCALES = { INR: 'en-IN', NPR: 'en-IN', USD: 'en-US', OMR: 'en-US' };

// ‎ keeps the Arabic OMR symbol from flipping to the right of the digits.
export const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', NPR: '₨', OMR: 'ر.ع.‎' };

const formatters = {};

function formatterFor(currency) {
  if (!formatters[currency]) {
    formatters[currency] = new Intl.NumberFormat(LOCALES[currency] || 'en-IN', { style: 'currency', currency });
  }
  return formatters[currency];
}

export function formatMoney(amount, currency = 'INR') {
  return formatterFor(currency)
    .formatToParts(Number(amount) || 0)
    .map(part => (part.type === 'currency' ? CURRENCY_SYMBOLS[currency] || part.value : part.value))
    .join('');
}
