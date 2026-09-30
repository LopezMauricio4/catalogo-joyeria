import { Prisma } from '@prisma/client';

export const componentInclude = { components: { include: { item: true } } } as const;

export function availableUnits(components: { quantity: Prisma.Decimal; item: { active: boolean; stock: Prisma.Decimal } }[]) {
  if (!components.length) return 0;
  return Math.min(2147483647, ...components.map(part => part.item.active
    ? new Prisma.Decimal(part.item.stock).div(part.quantity).floor().toNumber() : 0));
}

// Never expose internal SKUs, costs or the bill of materials in the public catalog.
export function presentProduct(product: any) {
  const { components, inventoryConfigured, stock, ...publicFields } = product;
  return publicFields;
}

export function parseComponents(value: unknown): { itemId: string; quantity: number }[] {
  let rows: any;
  try { rows = typeof value === 'string' ? JSON.parse(value) : value; } catch { rows = null; }
  if (!Array.isArray(rows) || !rows.length || rows.length > 100) throw Object.assign(new Error('Selecciona los materiales y las cantidades que necesita una pieza.'), { status: 400 });
  const ids = new Set();
  return rows.map(row => {
    const itemId = String(row?.itemId || '');
    const quantity = Number(row?.quantity);
    if (!itemId || ids.has(itemId) || !Number.isFinite(quantity) || quantity <= 0 || quantity > 1000000 || !new Prisma.Decimal(quantity).equals(new Prisma.Decimal(quantity).toDecimalPlaces(6))) {
      throw Object.assign(new Error('Revisa los materiales: sin duplicados y con cantidades positivas de hasta seis decimales.'), { status: 400 });
    }
    ids.add(itemId);
    return { itemId, quantity };
  });
}
