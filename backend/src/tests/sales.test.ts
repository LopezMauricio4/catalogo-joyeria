import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { SalesService, parseSale, allocateSaleTotal } from '../modules/sales/sales.service.js';
import { availableUnits, presentProduct, parseComponents } from '../modules/products/availability.js';
import { InventoryService } from '../modules/inventory/inventory.service.js';
import { randomUUID } from 'node:crypto';

const actor = { sub: 'test-admin', name: 'Administrador de prueba' };
const input = (id: string, extra: any = {}) => ({ requestKey: randomUUID(), customerName: 'Cliente de prueba', customerPhone: '3000000000', occurredAt: new Date().toISOString(), lines: [{ kind: 'inventory', id, quantity: 1, unitPrice: '100.25' }], ...extra });
after(async () => { await prisma.$disconnect(); });

test('disponibilidad decimal y sin exposición de materiales internos', () => {
  const components = [{ quantity: new Prisma.Decimal('0.1'), item: { stock: new Prisma.Decimal('0.3'), active: true } }];
  assert.equal(availableUnits(components), 3);
  assert.equal(availableUnits([]), 0);
  assert.equal(availableUnits([{ ...components[0], item: { ...components[0].item, active: false } }]), 0);
  assert.equal('components' in presentProduct({ id: 'x', components }), false);
  assert.throws(() => parseComponents([{ itemId: 'a', quantity: 1 }, { itemId: 'a', quantity: 2 }]));
});

test('ventas rechazan datos incompletos, negativos y precisión excesiva', () => {
  for (const data of [input('a', { customerName: '' }), input('a', { customerPhone: '' }), input('a', { lines: [] }), input('a', { lines: [{ kind: 'inventory', id: 'a', quantity: -1, unitPrice: 3 }] }), input('a', { lines: [{ kind: 'inventory', id: 'a', quantity: 1, unitPrice: '1.999' }] })]) assert.throws(() => parseSale(data));
});

test('venta por total: no requiere precios por línea y valida el importe', () => {
  const data = input('a', { total: '99.99', lines: [{ kind: 'inventory', id: 'a', quantity: 2 }] });
  assert.equal(parseSale(data).total?.toString(), '99.99');
  for (const total of ['', '-1', '1.001', 'NaN', null]) assert.throws(() => parseSale({ ...data, total }));
  assert.throws(() => parseSale({ ...data, lines: [{ kind: 'product', id: 'a', quantity: 1 }] }));
});

test('reparto de total conserva centavos, admite precio cero y cantidades fraccionarias', () => {
  for (const weights of [[1, 1, 1], [0, 0, 0], [10, 0, 20]]) {
    const records: any[] = weights.map(total => ({ total, quantity: '0.3' }));
    allocateSaleTotal(records, new Prisma.Decimal('10.01'));
    assert.equal(records.reduce((sum, line) => sum.add(line.total), new Prisma.Decimal(0)).toString(), '10.01');
    assert.ok(records.every(line => line.total.gte(0)));
  }
});

test('venta por total usa costos del servidor y descuenta todos los insumos', async () => {
  const item = { id: 'a', name: 'Balín', category: 'balines', size: '4 mm', sku: 'A', unit: 'milimetro', active: true, stock: new Prisma.Decimal(10), unitCost: new Prisma.Decimal('4.25'), salePrice: new Prisma.Decimal(8) };
  let saved: any, stock: any, movement: any;
  const tx: any = {
    sale: { findUnique: async () => null, create: async ({ data }: any) => { saved = { id: 'sale', ...data }; return saved; } },
    inventoryItem: { findUnique: async () => item, findUniqueOrThrow: async () => item, update: async ({ data }: any) => { stock = data.stock; } },
    inventoryMovement: { create: async ({ data }: any) => { movement = data; } },
  };
  const service = new SalesService((async (operation: any) => operation(tx)) as any);
  await service.create(input('a', { total: '20', lines: [{ kind: 'inventory', id: 'a', quantity: 3, unitCost: 0 }] }), actor);
  assert.equal(saved.total.toString(), '20');
  assert.equal(saved.lines.create[0].name, 'Balín de 4 mm');
  assert.equal(saved.lines.create[0].unit, 'unidad');
  assert.equal(saved.lines.create[0].quantity.toString(), '3');
  assert.equal(saved.totalCost.toString(), '12.75');
  assert.equal(saved.total.sub(saved.totalCost).toString(), '7.25');
  assert.equal(stock.toString(), '7');
  assert.equal(movement.quantity.toString(), '-3');
  assert.equal(saved.createdByName, actor.name);
});

test('base real: venta mixta, precios históricos, idempotencia, stock y permisos privados', { skip: process.env.RUN_DATABASE_TESTS !== '1' }, async () => {
  const rollback = new Error('rollback');
  await assert.rejects(prisma.$transaction(async tx => {
    const item = await tx.inventoryItem.create({ data: { sku: randomUUID(), name: 'Balín prueba', category: 'balines', stock: 10, unitCost: '10.10' } });
    const product = await tx.product.create({ data: { name: 'Manilla prueba', price: 100, material: 'laminado', category: 'manillas', visible: false, components: { create: { itemId: item.id, quantity: 3 } } } });
    const service = new SalesService((async (operation: (db: Prisma.TransactionClient) => Promise<any>) => operation(tx)) as any);
    const payload = input(item.id, { lines: [{ kind: 'product', id: product.id, quantity: 2, unitPrice: '100.25' }, { kind: 'inventory', id: item.id, quantity: 2, unitPrice: '20.50' }] });
    const sale = await service.create(payload, actor);
    assert.equal(sale.total.toString(), '241.5');
    assert.equal(sale.totalCost.toString(), '80.8');
    assert.equal(sale.createdByName, actor.name);
    assert.equal((await tx.inventoryItem.findUniqueOrThrow({ where: { id: item.id } })).stock.toString(), '2');
    assert.equal((await service.create(payload, actor)).id, sale.id);
    assert.equal(await tx.inventoryMovement.count({ where: { saleId: sale.id } }), 1);
    await assert.rejects(service.create({ ...payload, customerName: 'Cambio' }, actor), { status: 409 });
    await tx.inventoryItem.update({ where: { id: item.id }, data: { unitCost: 999 } });
    assert.equal((await tx.sale.findUniqueOrThrow({ where: { id: sale.id } })).totalCost.toString(), '80.8');
    const security = await tx.$queryRawUnsafe<any[]>(`SELECT relname,relrowsecurity,has_table_privilege('anon',oid,'SELECT,INSERT,UPDATE,DELETE') a,has_table_privilege('authenticated',oid,'SELECT,INSERT,UPDATE,DELETE') b FROM pg_class WHERE relname IN ('InventoryItem','InventoryMovement','ProductComponent','Sale','SaleLine') AND relnamespace='public'::regnamespace`);
    assert.equal(security.length, 5);
    for (const table of security) { assert.equal(table.relrowsecurity, true); assert.equal(table.a, false); assert.equal(table.b, false); }
    throw rollback;
  }, { timeout: 30000 }), error => error === rollback);
});

test('base real: dos ventas simultáneas no venden dos veces la última unidad; fallo no deja ventas parciales', { skip: process.env.RUN_DATABASE_TESTS !== '1' }, async () => {
  const item = await prisma.inventoryItem.create({ data: { sku: randomUUID(), name: 'Prueba concurrencia', category: 'otros', stock: 1, unitCost: 5 } });
  const requests = [input(item.id), input(item.id)];
  try {
    const service = new SalesService();
    const results = await Promise.allSettled(requests.map(payload => service.create(payload, actor)));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(results.filter(result => result.status === 'rejected').length, 1);
    assert.equal((await prisma.inventoryItem.findUniqueOrThrow({ where: { id: item.id } })).stock.toString(), '0');
    assert.equal(await prisma.sale.count({ where: { requestKey: { in: requests.map(r => r.requestKey) } } }), 1);
    await assert.rejects(new InventoryService().addMovement(item.id, { type: 'SALE', quantity: 1 }, actor.sub));
  } finally {
    await prisma.$transaction(async tx => {
      const sales = await tx.sale.findMany({ where: { requestKey: { in: requests.map(r => r.requestKey) } }, select: { id: true } });
      const ids = sales.map(sale => sale.id);
      await tx.inventoryMovement.deleteMany({ where: { itemId: item.id } });
      await tx.saleLine.deleteMany({ where: { saleId: { in: ids } } });
      await tx.sale.deleteMany({ where: { id: { in: ids } } });
      await tx.inventoryItem.delete({ where: { id: item.id } });
    });
  }
});
