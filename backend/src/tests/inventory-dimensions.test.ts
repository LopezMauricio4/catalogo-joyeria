import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InventoryService } from '../modules/inventory/inventory.service.js';

const service = new InventoryService({ inventoryItem: { create: async ({ data }: any) => data } } as any);
const base = { sku: 'TEST', name: 'Material', category: 'balines', material: 'oro laminado' };

test('editar precios conserva stock mínimo, estado y descripción omitidos', async () => {
  const existing = { ...base, id: 'a', size: '4 mm', stock: 9, minStock: 3, active: false, description: 'Referencia interna', image: null, images: [] };
  let saved: any;
  const db: any = { inventoryItem: { findUnique: async () => existing, update: async ({ data }: any) => { saved = data; return data; } } };
  const service = new InventoryService(db, undefined, (async (operation: any) => operation(db)) as any);
  await service.update('a', { ...base, size: '4 mm', unitCost: '20', salePrice: '30', stock: 500 });
  assert.equal(saved.minStock, 3);
  assert.equal(saved.active, false);
  assert.equal(saved.description, 'Referencia interna');
  assert.equal('stock' in saved, false);
});

test('balines laminados: seis tamaños válidos, normalizados a mm', async () => {
  for (const size of ['3', '4', '5', '6', '7', '8', '#4', '4 mm']) {
    const item = await service.create({ ...base, size });
    assert.match(item.size!, /^[3-8] mm$/);
    assert.equal(item.unit, 'unidad');
  }
  for (const size of ['', '2', '9', '3.5']) await assert.rejects(service.create({ ...base, size }));
});

test('topos laminados: tallas limitadas', async () => {
  for (const size of ['pequeño', 'mediano', 'grande']) assert.equal((await service.create({ ...base, category: 'topos', size })).size, size);
  await assert.rejects(service.create({ ...base, category: 'topos', size: '4' }));
});

test('medidas: longitud y grosor se guardan separados, peso opcional solo en oro', async () => {
  const input = { ...base, category: 'cadenas', lengthCm: '45', thicknessMm: '2.5', weightGrams: '3.125' };
  const chain = await service.create({ ...input, material: 'oro' });
  assert.equal(Number(chain.lengthCm), 45);
  assert.equal(Number(chain.thicknessMm), 2.5);
  assert.equal(Number(chain.weightGrams), 3.125);
  assert.equal((await service.create(input)).weightGrams, null);
  assert.equal((await service.create({ ...input, material: 'oro', weightGrams: '' })).weightGrams, null);
  assert.equal((await service.create({ ...input, category: 'dijes' })).lengthCm, null);
  for (const value of ['-1', '0', 'abc', '0.0001']) await assert.rejects(service.create({ ...input, lengthCm: value }));
});
