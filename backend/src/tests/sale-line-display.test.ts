import assert from 'node:assert/strict';
import { test } from 'node:test';
import { inventorySaleName, presentSaleLine } from '../modules/inventory/inventory-name.js';

test('venta de balines separa tamaño y cantidad sin cambiar cantidades históricas', () => {
  const item = { name: 'Balín', category: 'balines', size: '4 mm' };
  const result = presentSaleLine({ name: 'Balín', unit: 'milimetro', quantity: '12', item });
  assert.equal(result.name, 'Balín de 4 mm');
  assert.equal(result.quantity, '12');
  assert.equal(result.unit, 'unidad');
  assert.equal('item' in result, false);
  assert.equal(presentSaleLine({ name: 'Balín de 3 mm', unit: 'unidad', item }).name, 'Balín de 3 mm');
});

test('ventas guardan longitud y grosor como parte del nombre', () => {
  assert.equal(inventorySaleName({ name: 'Cadena', category: 'cadenas', lengthCm: 45, thicknessMm: 2.5 }), 'Cadena de 45 cm de longitud y 2,5 mm de grosor');
});
