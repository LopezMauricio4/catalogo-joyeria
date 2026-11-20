import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatCop, monthSummary, plural } from '../src/utils/adminFormat.js';

const clean = value => value.replace(/\s/g, ' ');
test('los pesos se muestran sin decimales salvo que existan', () => {
  assert.equal(clean(formatCop(1250)), '$ 1.250');
  assert.equal(clean(formatCop(125000.25)), '$ 125.000,25');
  assert.equal(clean(formatCop(0)), '$ 0');
  assert.equal(clean(formatCop(180000.5)), '$ 180.000,50');
});
test('el plural concuerda con la cantidad', () => {
  assert.equal(plural(1, 'producto', 'productos'), '1 producto');
  assert.equal(plural(0, 'producto', 'productos'), '0 productos');
});
test('el resumen del mes suma solo las ventas de ese mes', () => {
  const now = new Date(2026, 10, 19);
  const sales = [
    { occurredAt: new Date(2026, 10, 2).toISOString(), total: '100000', totalCost: '40000' },
    { occurredAt: new Date(2026, 10, 18).toISOString(), total: 50000, totalCost: 60000 },
    { occurredAt: new Date(2026, 9, 30).toISOString(), total: 999999, totalCost: 1 },
  ];
  assert.deepEqual(monthSummary(sales, now), { count: 2, total: 150000, profit: 50000 });
  assert.deepEqual(monthSummary([], now), { count: 0, total: 0, profit: 0 });
});
