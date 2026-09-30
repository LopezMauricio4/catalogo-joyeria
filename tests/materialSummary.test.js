import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeMaterials } from '../src/utils/materialSummary.js';

const items = [
  { id: 'balin', unitCost: 1000, salePrice: 2500 },
  { id: 'hilo', unitCost: 400, salePrice: 800 },
];
test('suma costos y venta de varios materiales según las cantidades usadas', () => {
  const result = summarizeMaterials([{ itemId: 'balin', quantity: '10' }, { itemId: 'hilo', quantity: '0.5' }], items);
  assert.equal(result.complete, true);
  assert.equal(result.totalCost, 10200);
  assert.equal(result.totalSale, 25400);
  const reduced = summarizeMaterials([{ itemId: 'hilo', quantity: '0.5' }], items);
  assert.equal(reduced.totalCost, 200);
  assert.equal(reduced.totalSale, 400);
});
test('selecciones incompletas o cantidades inválidas no permiten usar un total definitivo', () => {
  for (const part of [{ itemId: '', quantity: 1 }, { itemId: 'balin', quantity: '' }, { itemId: 'balin', quantity: '-2' }, { itemId: 'balin', quantity: 'NaN' }]) {
    const result = summarizeMaterials([part], items);
    assert.equal(result.complete, false);
    assert.equal(result.totalCost, 0);
  }
  assert.equal(summarizeMaterials([], items).complete, false);
});
test('los subtotales se redondean a centavos antes de sumarse', () => {
  const result = summarizeMaterials([{ itemId: 'a', quantity: 0.5 }, { itemId: 'b', quantity: 0.5 }], [
    { id: 'a', unitCost: 0.03, salePrice: 0.05 }, { id: 'b', unitCost: 0.03, salePrice: 0.05 },
  ]);
  assert.equal(result.totalCost, 0.04);
  assert.equal(result.totalSale, 0.06);
});
