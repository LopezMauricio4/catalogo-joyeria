import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { stockTransaction } from '../../lib/transactions.js';
import { componentInclude } from '../products/availability.js';
import { inventorySaleName, presentSaleLine } from '../inventory/inventory-name.js';

export class SaleError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const decimal = (value: unknown, places: number, positive = false) => {
  if (typeof value !== 'string' && typeof value !== 'number') throw new SaleError('Revisa las cantidades y precios.');
  let parsed: Prisma.Decimal;
  try { parsed = new Prisma.Decimal(value); } catch { throw new SaleError('Cantidad o precio no válido.'); }
  if (!parsed.isFinite() || parsed.lt(positive ? 0.000001 : 0) || parsed.gt(1000000000) || !parsed.equals(parsed.toDecimalPlaces(places))) throw new SaleError(`Usa valores válidos con máximo ${places} decimales.`);
  return parsed;
};
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
export function parseSale(input: any) {
  const total = input?.total === undefined ? undefined : decimal(input.total, 2);
  const customerName = text(input?.customerName, 150);
  const customerPhone = text(input?.customerPhone, 40);
  const requestKey = text(input?.requestKey, 100);
  const occurredAt = new Date(input?.occurredAt);
  if (!customerName || !/^[+\d\s()-]{6,40}$/.test(customerPhone)) throw new SaleError('Completa el nombre y un teléfono válido del cliente.');
  if (!/^[\da-f-]{36}$/i.test(requestKey)) throw new SaleError('Identificador de registro no válido.');
  if (!Number.isFinite(occurredAt.getTime()) || occurredAt.getTime() > Date.now() + 300000) throw new SaleError('Selecciona una fecha válida que no esté en el futuro.');
  if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > 50) throw new SaleError('Agrega entre 1 y 50 artículos a la venta.');
  const lines = input.lines.map((line: any) => {
    if (!['product', 'inventory'].includes(line?.kind) || typeof line.id !== 'string' || !line.id) throw new SaleError('Selecciona un producto o artículo del inventario.');
    const quantity = decimal(line.quantity, 6, true);
    if (line.kind === 'product' && !quantity.isInteger()) throw new SaleError('La cantidad de productos debe ser entera.');
    if (total !== undefined && line.kind !== 'inventory') throw new SaleError('La venta por valor total solo admite insumos del inventario.');
    return { kind: line.kind as 'product' | 'inventory', id: line.id, quantity, unitPrice: total === undefined ? decimal(line.unitPrice, 2) : new Prisma.Decimal(0) };
  });
  return { customerName, customerPhone, requestKey, occurredAt, note: text(input.note, 1000) || null, lines, ...(total === undefined ? {} : { total }) };
}

// Distribute the amount collected using the inventory sale-price weights.
// Cumulative rounding preserves the exact total, including fractional quantities.
export function allocateSaleTotal(records: Prisma.SaleLineCreateWithoutSaleInput[], total: Prisma.Decimal) {
  let weights = records.map(line => new Prisma.Decimal(String(line.total)));
  let weightTotal = weights.reduce((sum, weight) => sum.add(weight), new Prisma.Decimal(0));
  if (weightTotal.isZero()) {
    weights = records.map(() => new Prisma.Decimal(1));
    weightTotal = new Prisma.Decimal(records.length);
  }
  let cumulative = new Prisma.Decimal(0), allocated = new Prisma.Decimal(0);
  records.forEach((line, index) => {
    cumulative = cumulative.add(weights[index]);
    const throughLine = total.mul(cumulative).div(weightTotal).toDecimalPlaces(2);
    const subtotal = throughLine.sub(allocated);
    line.total = subtotal;
    line.unitPrice = subtotal.div(new Prisma.Decimal(String(line.quantity))).toDecimalPlaces(2);
    allocated = throughLine;
  });
}

export class SalesService {
  constructor(private transact: typeof stockTransaction = stockTransaction) {}
  async list(page = 1) {
    const take = 30;
    const [sales, total] = await prisma.$transaction([
      prisma.sale.findMany({ orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * take, take, include: { lines: { include: { item: { select: { name: true, category: true, size: true, lengthCm: true, thicknessMm: true } } } } } }),
      prisma.sale.count(),
    ]);
    return { sales: sales.map(sale => ({ ...sale, lines: sale.lines.map(presentSaleLine) })), total, page, pages: Math.max(1, Math.ceil(total / take)) };
  }

  async create(input: unknown, actor: { sub: string; name: string }) {
    const parsed = parseSale(input);
    const requestHash = createHash('sha256').update(JSON.stringify({ ...parsed, actor: actor.sub })).digest('hex');
    const replay = (sale: any) => {
      if (sale.createdBy !== actor.sub || sale.requestHash !== requestHash) throw new SaleError('Este registro ya se usó con otros datos. Actualiza la lista de ventas antes de continuar.', 409);
      return sale;
    };
    try {
      return await this.transact(async tx => {
        const existing = await tx.sale.findUnique({ where: { requestKey: parsed.requestKey }, include: { lines: true } });
        if (existing) return replay(existing);
        const requirements = new Map<string, Prisma.Decimal>();
        const records: Prisma.SaleLineCreateWithoutSaleInput[] = [];
        const need = (id: string, qty: Prisma.Decimal) => requirements.set(id, (requirements.get(id) || new Prisma.Decimal(0)).add(qty));
        for (const line of parsed.lines) {
          let name: string, unit: string, sku: string | null = null;
          let unitCost = new Prisma.Decimal(0);
          let unitPrice = line.unitPrice;
          if (line.kind === 'product') {
            const product = await tx.product.findUnique({ where: { id: line.id }, include: componentInclude });
            if (!product || !product.components.length) throw new SaleError('El producto no existe o no tiene materiales asignados.');
            name = product.name; unit = 'unidad';
            for (const part of product.components) {
              if (!part.item.active) throw new SaleError(`El insumo ${part.item.name} está inactivo.`);
              need(part.itemId, part.quantity.mul(line.quantity));
              unitCost = unitCost.add(part.quantity.mul(part.item.unitCost));
            }
          } else {
            const item = await tx.inventoryItem.findUnique({ where: { id: line.id } });
            if (!item || !item.active) throw new SaleError('El artículo del inventario no está disponible.');
            unit = item.category === 'balines' ? 'unidad' : item.unit;
            if (['unidad', 'par'].includes(unit) && !line.quantity.isInteger()) throw new SaleError('Las unidades y los pares se venden en cantidades enteras.');
            name = inventorySaleName(item); sku = item.sku; unitCost = item.unitCost;
            if (parsed.total !== undefined) unitPrice = item.salePrice;
            need(item.id, line.quantity);
          }
          unitCost = unitCost.toDecimalPlaces(6);
          records.push({ name, unit, sku, quantity: line.quantity, unitPrice, unitCost,
            total: unitPrice.mul(line.quantity).toDecimalPlaces(2), totalCost: unitCost.mul(line.quantity).toDecimalPlaces(2),
            ...(line.kind === 'product' ? { product: { connect: { id: line.id } } } : { item: { connect: { id: line.id } } }) });
        }
        if (parsed.total !== undefined) allocateSaleTotal(records, parsed.total);
        const total = records.reduce((sum, line) => sum.add(new Prisma.Decimal(String(line.total))), new Prisma.Decimal(0));
        const totalCost = records.reduce((sum, line) => sum.add(new Prisma.Decimal(String(line.totalCost))), new Prisma.Decimal(0));
        const sale = await tx.sale.create({ data: { requestKey: parsed.requestKey, requestHash,
          customerName: parsed.customerName, customerPhone: parsed.customerPhone, occurredAt: parsed.occurredAt,
          note: parsed.note, createdBy: actor.sub, createdByName: actor.name, total, totalCost, lines: { create: records } }, include: { lines: true } });
        // Aggregate shared materials before checking availability; all changes roll back on failure.
        for (const [itemId, quantity] of [...requirements].sort(([a], [b]) => a.localeCompare(b))) {
          const item = await tx.inventoryItem.findUniqueOrThrow({ where: { id: itemId } });
          if (!item.active || item.stock.lt(quantity)) throw new SaleError(`Stock insuficiente de ${item.name}: necesitas ${quantity.toString()} y hay ${item.stock.toString()}.`, 409);
          const resultingStock = item.stock.sub(quantity);
          await tx.inventoryItem.update({ where: { id: itemId }, data: { stock: resultingStock } });
          await tx.inventoryMovement.create({ data: { itemId, saleId: sale.id, type: 'SALE', quantity: quantity.neg(),
            previousStock: item.stock, resultingStock, unitCost: item.unitCost, createdBy: actor.sub, note: `Venta ${sale.id}` } });
        }
        return sale;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const sale = await prisma.sale.findUnique({ where: { requestKey: parsed.requestKey }, include: { lines: true } });
        if (sale) return replay(sale);
      }
      throw error;
    }
  }
}
