import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterProducts, readCatalogFilters, validatePriceRange, formatPrice } from '../src/utils/catalog.js';
import { generateProductMessage, buildWhatsAppLink } from '../src/utils/whatsappGenerator.js';

const products = [
  { id: 'a', name: 'Anillo Órbita', category: 'anillos', material: 'oro-18k', price: 120000, stock: 3, createdAt: '2026-09-01', featured: false },
  { id: 'b', name: 'Anillo Luna', category: 'anillos', material: 'laminado', price: 60000, stock: 0, createdAt: '2026-09-02', featured: true },
  { id: 'c', name: 'Cadena', category: 'cadenas', material: 'laminado', price: 80000, stock: 2, createdAt: '2026-09-03', featured: true },
];
const filters = query => readCatalogFilters(new URLSearchParams(query));
test('material, categoría, búsqueda y precio se combinan sin alterar los productos', () => {
  const original = JSON.stringify(products);
  assert.deepEqual(filterProducts(products, filters('material=oro-18k&categoria=anillos&q=orbita&min=100000&max=150000')).map(p => p.id), ['a']);
  assert.deepEqual(filterProducts(products, filters('material=laminado&categoria=anillos&disponible=1')), []);
  assert.equal(JSON.stringify(products), original);
});
test('orden por fecha y precio; destacados disponibles antes que agotados', () => {
  assert.deepEqual(filterProducts(products, filters('orden=newest')).map(p => p.id), ['c', 'b', 'a']);
  assert.deepEqual(filterProducts(products, filters('orden=price-asc')).map(p => p.id), ['b', 'c', 'a']);
  assert.deepEqual(filterProducts(products, filters('orden=price-desc')).map(p => p.id), ['a', 'c', 'b']);
  assert.deepEqual(filterProducts(products, filters('')).map(p => p.id), ['c', 'a', 'b']);
});
test('rango invertido o inválido produce un mensaje; cero y límite vacío son válidos', () => {
  assert.ok(validatePriceRange('100', '50'));
  assert.ok(validatePriceRange('-1', ''));
  assert.ok(validatePriceRange('no', '200'));
  assert.equal(validatePriceRange('0', ''), '');
  assert.equal(validatePriceRange('100', '100'), '');
});
test('restablecer parámetros elimina toda la búsqueda y los filtros', () => {
  const params = new URLSearchParams('q=orbita&material=oro-18k&categoria=anillos&min=150000&disponible=1');
  assert.equal(filterProducts(products, readCatalogFilters(params)).length, 0);
  assert.equal(filterProducts(products, readCatalogFilters(new URLSearchParams())).length, 3);
});
test('WhatsApp identifica pieza, material, precio COP y enlace, sin confirmar una compra', () => {
  const message = generateProductMessage(products[0], 'https://ejemplo.com');
  const link = new URL(buildWhatsAppLink(message));
  assert.equal(link.hostname, 'wa.me');
  assert.equal(link.searchParams.get('text'), message);
  assert.match(message, /Anillo Órbita/);
  assert.match(message, /Oro 18k/);
  assert.match(message, /COP/);
  assert.match(message, /Referencia: a/);
  assert.match(message, /https:\/\/ejemplo.com\/producto\/a/);
  assert.match(message, /confirmas disponibilidad/);
});
test('agotados preguntan por reposición y material laminado usa su nombre completo', () => {
  const message = generateProductMessage(products[1]);
  assert.match(message, /Oro laminado 18k/);
  assert.match(message, /agotada/);
  assert.match(message, /pieza similar/);
  assert.equal(formatPrice(undefined), 'Consultar precio');
});
