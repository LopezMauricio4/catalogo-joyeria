import assert from 'node:assert/strict';
import { test } from 'node:test';
import { disclosureFeatures, readProductDisclosure } from '../src/utils/productDisclosure.js';
import { formatPrice } from '../src/utils/catalog.js';

test('composición y medidas se conservan con comas y decimales al editar', () => {
  const form = { composition: 'Oro laminado, cordón textil', measurements: '18,5 cm de longitud, 3 mm', features: 'Ajustable, Brillante' };
  const stored = disclosureFeatures(form);
  assert.deepEqual(readProductDisclosure(stored), form);
  assert.equal(stored.filter(value => value.startsWith('Medidas: ')).length, 1);
});
test('fichas antiguas no reciben medidas inventadas y el precio conserva centavos', () => {
  assert.equal(readProductDisclosure(['Acabado brillante']).measurements, '');
  assert.match(formatPrice(1234.56), /1\.234,56/);
});
