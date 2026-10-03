import assert from 'node:assert/strict';
import { test } from 'node:test';
import { inventoryName } from '../src/utils/inventoryName.js';

test('nombre de inventario incluye tamaños y medidas como una frase', () => {
  assert.equal(inventoryName({ name: 'Balín', category: 'balines', size: '4' }), 'Balín de 4 mm');
  assert.equal(inventoryName({ name: 'Balín', category: 'balines', size: '4 mm' }), 'Balín de 4 mm');
  assert.equal(inventoryName({ name: 'Cadena', lengthCm: '45', thicknessMm: '2.5' }), 'Cadena de 45 cm de longitud y 2,5 mm de grosor');
  assert.equal(inventoryName({ name: 'Dije', lengthCm: null, thicknessMm: '' }), 'Dije');
});
