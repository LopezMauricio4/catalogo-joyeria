import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ProductService } from '../modules/products/product.service.js';

const first = 'https://example.com/first.jpg';
const second = 'https://example.com/second.jpg';
const third = 'https://example.com/third.jpg';
const fields = { name: 'Manilla', price: 100, material: 'laminado', category: 'manillas' };
const file = { buffer: Buffer.from('test photo') };
function setup(images = [first, second]) {
  const existing = { ...fields, id: 'product', images, image: images[0] };
  let uploadCalls = 0;
  const service = new ProductService({ product: {
    findUnique: async () => existing,
    update: async ({ data }: any) => ({ ...existing, ...data }),
    create: async ({ data }: any) => ({ id: 'new', ...data }),
  } } as any, async files => { uploadCalls += 1; return files.map((_, i) => i === 0 ? third : `https://example.com/new${i}.jpg`); });
  return { service, uploads: () => uploadCalls };
}

test('editar agrega fotos sin borrar las actuales y conserva la principal', async () => {
  const { service } = setup();
  const saved = await service.actualizarProducto('product', fields, [file]);
  assert.deepEqual(saved.images, [first, second, third]);
  assert.equal(saved.image, first);
});
test('solo elimina las fotos indicadas por el administrador al guardar', async () => {
  const { service } = setup();
  const saved = await service.actualizarProducto('product', { ...fields, removedImages: JSON.stringify([first]) }, [file]);
  assert.deepEqual(saved.images, [second, third]);
  assert.equal(saved.image, second);
});
test('limita a cinco el total de fotos existentes, URL y archivos antes de subir', async () => {
  const { service, uploads } = setup([first, second, third, 'https://example.com/4.jpg']);
  await assert.rejects(service.actualizarProducto('product', fields, [file, file]), /hasta 5/);
  await assert.rejects(service.actualizarProducto('product', { ...fields, image: 'https://example.com/5.jpg' }, [file]), /hasta 5/);
  assert.equal(uploads(), 0);
  assert.equal((await service.actualizarProducto('product', { ...fields, removedImages: [third] }, [file, file])).images.length, 5);
});
test('rechaza eliminar fotos ajenas o dejar la galería vacía', async () => {
  const { service } = setup();
  await assert.rejects(service.actualizarProducto('product', { ...fields, removedImages: [third] }), /Solo puedes quitar/);
  await assert.rejects(service.actualizarProducto('product', { ...fields, removedImages: 'invalid json' }), /no es válida/);
  await assert.rejects(service.actualizarProducto('product', { ...fields, removedImages: [first, second] }), /al menos una/);
});
test('crea un producto con cinco imágenes', async () => {
  const { service } = setup();
  assert.equal((await service.crearProducto(fields, Array.from({ length: 5 }, () => file))).images.length, 5);
});

test('ordena fotos nuevas y actuales y establece la primera como portada', async () => {
  const { service } = setup();
  const saved = await service.actualizarProducto('product', { ...fields, imageOrder: JSON.stringify(['new:0', second, first]) }, [file]);
  assert.deepEqual(saved.images, [third, second, first]);
  assert.equal(saved.image, third);
  const reordered = await service.actualizarProducto('product', { ...fields, imageOrder: [second, first] });
  assert.deepEqual(reordered.images, [second, first]);
  assert.equal(reordered.image, second);
});
test('rechaza órdenes incompletos, repetidos o ajenos antes de subir fotos', async () => {
  const { service, uploads } = setup();
  for (const imageOrder of [[first, first, 'new:0'], [first, second], [first, second, 'new:9'], 'invalid']) {
    await assert.rejects(service.actualizarProducto('product', { ...fields, imageOrder }, [file]), /orden/i);
  }
  assert.equal(uploads(), 0);
});
