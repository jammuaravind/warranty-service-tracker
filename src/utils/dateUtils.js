// Dates from the API are "YYYY-MM-DD" strings. new Date("2026-08-15") would be read as UTC
// and can show the wrong day, so we always build LOCAL dates from the parts.
export function parseDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  // Reject impossible dates such as 2026-02-31
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

export function toISODate(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function today() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

// Adds months and keeps the day valid (31 Jan + 1 month = 28/29 Feb)
export function addMonths(date, months) {
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
}

export function daysBetween(from, to) {
  return Math.round((to - from) / 86400000);
}

export function formatDate(value) {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDuration(months) {
  const m = Number(months);
  if (!m) return '—';
  if (m % 12 === 0) return `${m / 12} ${m === 12 ? 'year' : 'years'}`;
  return `${m} ${m === 1 ? 'month' : 'months'}`;
}
