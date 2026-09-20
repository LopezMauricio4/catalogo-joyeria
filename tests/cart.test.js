import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseCart, resolveCart, stockLimit, cartSubtotal } from '../src/utils/cart.js';
import { generateCartMessage, buildWhatsAppLink } from '../src/utils/whatsappGenerator.js';

const products = [{ id: 'a', name: 'Anillo', material: 'oro-18k', price: 100000, stock: 3 }, { id: 'b', name: 'Cadena', material: 'laminado', price: 0, stock: null }];
test('el carrito recupera solo IDs y cantidades válidas sin confiar en precios guardados', () => {
  assert.deepEqual(parseCart('malformed'), []);
  assert.deepEqual(parseCart('{}'), []);
  assert.deepEqual(parseCart(JSON.stringify([{ id: 'a', quantity: 2, price: 1 }, { id: 'a', quantity: 2 }, { id: 'b', quantity: -1 }, null, { id: 'c', quantity: 2.5 }])), [{ id: 'a', quantity: 2 }]);
});
test('detecta piezas eliminadas, agotadas y cantidades que superan el stock actualizado', () => {
  const items = [{ id: 'a', quantity: 4 }, { id: 'missing', quantity: 1 }, { id: 'b', quantity: 1 }];
  const rows = resolveCart(items, products);
  assert.ok(rows[0].issue);
  assert.ok(rows[1].issue);
  assert.equal(rows[2].issue, '');
  assert.ok(resolveCart([{ id: 'a', quantity: 1 }], [{ ...products[0], stock: 0 }])[0].issue);
  assert.equal(stockLimit({ stock: null }), 99);
});
test('calcula subtotal con precios actuales y prepara todas las referencias para WhatsApp', () => {
  const rows = resolveCart([{ id: 'a', quantity: 2 }, { id: 'b', quantity: 1 }], products);
  assert.equal(cartSubtotal(rows), 200000);
  const message = generateCartMessage(rows, 'https://alpez.example');
  assert.match(message, /Cantidad: 2/);
  assert.match(message, /Referencia: a/);
  assert.match(message, /Referencia: b/);
  assert.match(message, /precio por confirmar/);
  assert.match(message, /confirmas disponibilidad/);
  assert.match(message, /https:\/\/alpez.example\/producto\/a/);
  assert.equal(new URL(buildWhatsAppLink(message)).searchParams.get('text'), message);
});
