import { parseDate, addMonths, today, daysBetween } from './dateUtils.js';

export const EXPIRING_DAYS = 30;

// Derived value: purchase date + warranty months
export function getExpiryDate(product) {
  const purchase = parseDate(product.purchaseDate);
  const months = Number(product.warrantyDurationMonths);
  if (!purchase || !Number.isFinite(months)) return null;
  return addMonths(purchase, months);
}

// One function used by the dashboard, product list and details page.
// The warranty is valid THROUGH its expiry date, so it is expired only when today is after it.
export function getWarrantyStatus(product) {
  const expiry = getExpiryDate(product);
  if (!expiry) return { key: 'unknown', label: 'Unknown', daysLeft: null, expiry: null };
  const daysLeft = daysBetween(today(), expiry);
  if (daysLeft < 0) return { key: 'expired', label: 'Expired', daysLeft, expiry };
  if (daysLeft <= EXPIRING_DAYS) return { key: 'expiring', label: 'Expiring Soon', daysLeft, expiry };
  return { key: 'active', label: 'Active', daysLeft, expiry };
}

export function daysLeftText(status) {
  const d = status.daysLeft;
  if (d === null) return '';
  if (d < 0) return `Expired ${Math.abs(d)} ${Math.abs(d) === 1 ? 'day' : 'days'} ago`;
  if (d === 0) return 'Expires today';
  return `${d} ${d === 1 ? 'day' : 'days'} left`;
}

export function getDashboardStats(products) {
  const stats = { total: products.length, active: 0, expiring: 0, expired: 0 };
  products.forEach((p) => {
    const k = getWarrantyStatus(p).key;
    if (k === 'active') stats.active += 1;
    if (k === 'expiring') stats.expiring += 1;
    if (k === 'expired') stats.expired += 1;
  });
  return stats;
}

// Service dates today or later, within the next 60 days, soonest first
export function getUpcomingServices(products, withinDays = 60) {
  const now = today();
  return products
    .map((p) => ({ product: p, date: parseDate(p.serviceDate) }))
    .filter((x) => x.date && daysBetween(now, x.date) >= 0 && daysBetween(now, x.date) <= withinDays)
    .sort((a, b) => a.date - b.date);
}

// Warranties that have not expired yet, soonest expiry first
export function getUpcomingExpirations(products) {
  return products
    .map((p) => ({ product: p, status: getWarrantyStatus(p) }))
    .filter((x) => x.status.key === 'active' || x.status.key === 'expiring')
    .sort((a, b) => a.status.expiry - b.status.expiry);
}
