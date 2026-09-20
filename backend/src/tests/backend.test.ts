import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ProductService } from '../modules/products/product.service.js';
import { createRequireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { prisma } from '../lib/prisma.js';

const payload = { name: 'Prueba', price: 150, material: 'oro-18k', category: 'anillos', stock: 2, image: 'https://example.com/test.jpg' };

test('validación rechaza stock fraccionario, precio inválido y material desconocido antes de escribir', async () => {
  const service = new ProductService({ product: {} } as any);
  for (const change of [{ stock: 1.5 }, { stock: -1 }, { price: 'NaN' }, { material: 'otro' }, { image: 'javascript:alert(1)' }]) {
    await assert.rejects(service.crearProducto({ ...payload, ...change }));
  }
});

test('editar usa update, mantiene el ID y conserva todas las imágenes', async () => {
  const existing = { ...payload, id: 'same-id', images: [payload.image, 'https://example.com/second.jpg'] };
  let updated: any;
  const service = new ProductService({ product: {
    findUnique: async () => existing,
    update: async (args: any) => { updated = args; return { ...existing, ...args.data }; },
  } } as any);
  const result = await service.actualizarProducto('same-id', { ...payload, name: 'Editado', stock: 0, featured: true });
  assert.equal(updated.where.id, 'same-id');
  assert.equal(result.name, 'Editado');
  assert.equal(result.stock, 0);
  assert.equal(result.featured, true);
  assert.deepEqual(result.images, existing.images);
});

test('borrar o editar un producto inexistente devuelve 404', async () => {
  const service = new ProductService({ product: {
    findUnique: async () => null,
    delete: async () => { throw Object.assign(new Error(), { code: 'P2025' }); },
  } } as any);
  await assert.rejects(service.actualizarProducto('missing', payload), { status: 404 });
  await assert.rejects(service.eliminarProducto('missing'), { status: 404 });
});

test('permisos: sin token y token inválido 401; cliente y rol falsificado 403; admin autorizado', async () => {
  for (const scenario of [
    { token: '', user: null, expected: 401 },
    { token: 'invalid', user: null, expected: 401 },
    { token: 'client', user: { id: '1', app_metadata: {}, user_metadata: { role: 'admin' } }, expected: 403 },
    { token: 'admin', user: { id: '2', app_metadata: { role: 'admin' } }, expected: 200 },
  ]) {
    let status = 200;
    const req: any = { headers: { authorization: scenario.token ? `Bearer ${scenario.token}` : undefined } };
    const res: any = { status: (value: number) => { status = value; return res; }, json: () => res };
    const guard = createRequireAuth((() => ({ auth: { getUser: async () => ({ data: { user: scenario.user }, error: null }) } })) as any);
    await guard(req, res, (error?: any) => { if (error) throw error; requireAdmin(req, res, () => {}); });
    assert.equal(status, scenario.expected);
  }
});

test('base real: crear, leer, editar y eliminar dentro de una transacción revertida', { skip: process.env.RUN_DATABASE_TESTS !== '1' }, async () => {
  const rollback = new Error('ROLLBACK_TEST');
  try {
    await assert.rejects(prisma.$transaction(async (tx) => {
      const service = new ProductService(tx);
      const created = await service.crearProducto(payload);
      assert.ok(created.id);
      const found = await tx.product.findUnique({ where: { id: created.id } });
      assert.equal(found?.name, payload.name);
      await service.actualizarProducto(created.id, { ...payload, name: 'Editado', price: 200, stock: 0, featured: true });
      const updated = await tx.product.findUnique({ where: { id: created.id } });
      assert.equal(updated?.price, 200);
      assert.equal(updated?.stock, 0);
      assert.equal(updated?.featured, true);
      await service.eliminarProducto(created.id);
      assert.equal(await tx.product.findUnique({ where: { id: created.id } }), null);
      const [security] = await tx.$queryRawUnsafe<any[]>(`SELECT relrowsecurity,
        has_table_privilege('anon', 'public."Product"', 'INSERT,UPDATE,DELETE,TRUNCATE') AS anon_write,
        has_table_privilege('authenticated', 'public."Product"', 'INSERT,UPDATE,DELETE,TRUNCATE') AS client_write
        FROM pg_class WHERE oid = 'public."Product"'::regclass`);
      assert.equal(security.relrowsecurity, true);
      assert.equal(security.anon_write, false);
      assert.equal(security.client_write, false);
      throw rollback;
    }, { timeout: 20000 }), (error) => error === rollback);
  } finally { await prisma.$disconnect(); }
});
