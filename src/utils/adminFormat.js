// Shared figures for the admin screens: pesos without ",00"; when there are cents, always two digits.
const whole = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatCop = value => {
  const amount = Number(value) || 0;
  return (Math.round(amount * 100) % 100 === 0 ? whole : cents).format(amount);
};
export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
// Month summary computed from the loaded sales (every page is fetched), by the sale's own date.
export function monthSummary(sales, now = new Date()) {
  const inMonth = sales.filter(sale => { const date = new Date(sale.occurredAt); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); });
  const total = inMonth.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const cost = inMonth.reduce((sum, sale) => sum + Number(sale.totalCost || 0), 0);
  return { count: inMonth.length, total, profit: total - cost };
}
