// 'morning' before noon, 'afternoon' until 5pm, 'evening' after that.
export function partOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// The backend stores dates as 'YYYY-MM-DD'. new Date('2026-10-22') would read that as UTC midnight,
// which is the previous day for anyone west of London, so build a local date from the parts instead.
export function formatDate(isoDate) {
  const [year, month, day] = String(isoDate).split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  // en-GB writes September as "Sept"; trim every month to three letters so the list lines up.
  return dateFormatter
    .formatToParts(new Date(year, month - 1, day))
    .map(part => (part.type === 'month' ? part.value.slice(0, 3) : part.value))
    .join('');
}
