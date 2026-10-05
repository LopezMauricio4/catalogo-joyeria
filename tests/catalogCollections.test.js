import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterProducts, readCollectionFilters, resetCollectionFilters } from '../src/utils/catalog.js';

const products = [
  { id: 'gold-ring', category: 'anillos', material: 'oro-18k', name: 'Anillo', price: 100 },
  { id: 'laminated-ring', category: 'anillos', material: 'laminado', name: 'Anillo', price: 50 },
  { id: 'laminated-chain', category: 'cadenas', material: 'laminado', name: 'Cadena', price: 60 },
];
test('el catálogo siempre muestra un solo material incluso sin selección o con un valor inválido', () => {
  for (const query of ['', 'material=', 'material=otro', 'material=toString']) {
    const filters = readCollectionFilters(new URLSearchParams(query));
    assert.equal(filters.material, 'oro-18k');
    assert.deepEqual(filterProducts(products, filters).map(product => product.id), ['gold-ring']);
  }
});
test('todas las piezas y limpiar filtros conservan la colección seleccionada', () => {
  const params = new URLSearchParams('material=laminado&categoria=anillos&q=anillo&min=50');
  assert.deepEqual(filterProducts(products, readCollectionFilters(params)).map(product => product.id), ['laminated-ring']);
  params.delete('categoria');
  assert.equal(readCollectionFilters(params).material, 'laminado');
  const reset = resetCollectionFilters(params);
  assert.equal(reset.toString(), 'material=laminado');
  assert.deepEqual(filterProducts(products, readCollectionFilters(reset)).map(product => product.id), ['laminated-ring', 'laminated-chain']);
});
