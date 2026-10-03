import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createProductPreview, renderProductPreview } from '../modules/products/product-preview.js';

const template = '<html><head><title>Alpez</title><meta property="og:title" content="General" /><meta name="description" content="General" /><meta name="twitter:card" content="summary" /></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>';
const product = { id: 'a', name: 'Anillo tres carriles', description: 'Balines diamantados', material: 'oro-18k', price: 430000, image: 'https://example.com/cover.jpg', images: ['https://example.com/second.jpg'], visible: true };

test('el HTML inicial incluye la portada y metadatos de la prenda sin quitar la aplicación', () => {
  const html = renderProductPreview(template, product, 'https://alpez.example/producto/a');
  assert.match(html, /property="og:image" content="https:\/\/example.com\/cover.jpg"/);
  assert.match(html, /property="og:title" content="Anillo tres carriles · Alpez Joyería"/);
  assert.match(html, /Oro 18k ·.*430\.000/);
  assert.match(html, /src="\/assets\/app.js"/);
  assert.equal((html.match(/property="og:title"/g) || []).length, 1);
  assert.equal((html.match(/name="description"/g) || []).length, 1);
  assert.doesNotMatch(html, /second.jpg/);
});
test('escapa texto del producto y conserva caracteres literales al crear el HTML', () => {
  const html = renderProductPreview(template, { ...product, name: '<script>"$&"</script>' }, 'https://alpez.example/producto/a');
  assert.match(html, /&lt;script&gt;&quot;\$&amp;&quot;&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>"/);
});
test('las prendas ocultas no revelan nombre ni portada en la vista previa', async () => {
  let status = 200, body = '';
  const handler = createProductPreview({ findProduct: async () => ({ ...product, visible: false }), readTemplate: async () => template });
  const res: any = { set: () => res, status: (value: number) => { status = value; return res; }, type: () => res, send: (value: string) => { body = value; return res; } };
  await handler({ params: { id: 'a' } } as any, res);
  assert.equal(status, 404);
  assert.equal(body, template);
  assert.doesNotMatch(body, /cover.jpg|Anillo tres carriles/);
});
