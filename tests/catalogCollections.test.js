import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalogSearchParams, filterProducts, readCollectionFilters, resetCollectionFilters } from '../src/utils/catalog.js';

const products = [
  { id: 'gold-ring', category: 'anillos', material: 'oro-18k', name: 'Anillo', price: 100 },
  { id: 'laminated-ring', category: 'anillos', material: 'laminado', name: 'Anillo', price: 50 },
  { id: 'laminated-chain', category: 'cadenas', material: 'laminado', name: 'Cadena', price: 60 },
];
test('el catálogo general no oculta materiales sin una selección explícita válida', () => {
  for (const query of ['', 'material=', 'material=otro', 'material=toString']) {
    const filters = readCollectionFilters(new URLSearchParams(query));
    assert.equal(filters.material, '');
    assert.equal(filterProducts(products, filters).length, products.length);
  }
});
test('una categoría del inicio incluye sus piezas de ambos materiales', () => {
  const filters = readCollectionFilters(new URLSearchParams('categoria=cadenas'));
  assert.deepEqual(filterProducts(products, filters).map(product => product.id), ['laminated-chain']);
  assert.equal(resetCollectionFilters(new URLSearchParams('categoria=cadenas')).toString(), '');
});
test('la búsqueda global encuentra piezas fuera del material y la categoría anteriores', () => {
  const filters = readCollectionFilters(catalogSearchParams('Cadena'));
  assert.deepEqual(filterProducts(products, filters).map(product => product.id), ['laminated-chain']);
  assert.equal(catalogSearchParams('').toString(), '');
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
