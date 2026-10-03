import { stockTransaction } from '../../lib/transactions.js';
import { randomUUID } from 'node:crypto';
import { InventoryMovementType, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { subirMultiplesACloudinary } from '../../cloudinary.js';
import type { ArchivoConBuffer, InventoryItemDTO, InventoryMovementDTO } from './inventory.types.js';

export class InventoryError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const categories = ['balines', 'herrajes', 'pasantes', 'cadenas', 'pulseras', 'dijes', 'candongas', 'topos', 'otros'];
const materials = ['oro', 'oro laminado'];
const units = ['unidad', 'par', 'gramo', 'metro', 'milimetro'];
const movementTypes = Object.values(InventoryMovementType);

const parseNumber = (value: unknown, label: string, minimum = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum) throw new InventoryError(`${label} debe ser un número válido.`);
  return parsed;
};

const imageUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
  } catch { throw new InventoryError('La imagen debe ser una URL HTTP o HTTPS válida.'); }
};

const parseItem = (input: InventoryItemDTO) => {
  const sku = String(input.sku ?? '').trim().toUpperCase() || `INS-${randomUUID().toUpperCase()}`;
  const name = String(input.name ?? '').trim();
  const category = String(input.category ?? '').trim().toLowerCase();
  const material = String(input.material ?? '').trim();
  let size = String(input.size ?? '').trim();
  const unit = category === 'balines' ? 'unidad' : String(input.unit ?? 'unidad').trim().toLowerCase();
  if (!name) throw new InventoryError('El nombre es obligatorio.');
  if (!categories.includes(category)) throw new InventoryError('Categoría de inventario no válida.');
  if (!materials.includes(material)) throw new InventoryError('Material no válido. Selecciona oro u oro laminado.');
  if (!units.includes(unit)) throw new InventoryError('Unidad de medida no válida.');
  if (material === 'oro laminado' && category === 'balines') {
    const diameter = size.replace(/^#\s*/, '').replace(/\s*mm$/i, '');
    if (!['3', '4', '5', '6', '7', '8'].includes(diameter)) throw new InventoryError('El tamaño del balín debe ser de 3 a 8 mm.');
    size = `${diameter} mm`;
  }
  if (material === 'oro laminado' && category === 'topos') {
    size = size.toLowerCase();
    if (!['pequeño', 'mediano', 'grande'].includes(size)) throw new InventoryError('Selecciona pequeño, mediano o grande para los topos.');
  }
  const optionalMeasure = (value: unknown, label: string) => {
    if (value == null || String(value).trim() === '') return null;
    const number = parseNumber(value, label, 0.001);
    if (number >= 1e9 || Math.abs(number * 1000 - Math.round(number * 1000)) > 0.00001) throw new InventoryError(`${label} admite hasta tres decimales.`);
    return number;
  };
  const elongated = ['cadenas', 'pulseras'].includes(category);
  const lengthCm = elongated ? optionalMeasure(input.lengthCm, 'La longitud') : null;
  const thicknessMm = elongated ? optionalMeasure(input.thicknessMm, 'El grosor') : null;
  const weightGrams = material === 'oro' ? optionalMeasure(input.weightGrams, 'El peso') : null;
  const stock = parseNumber(input.stock ?? 0, 'El stock');
  const minStock = parseNumber(input.minStock ?? 0, 'El stock mínimo');
  const unitCost = parseNumber(input.unitCost ?? 0, 'El costo unitario');
  const salePrice = parseNumber(input.salePrice ?? 0, 'El precio de venta');
  if (input.active !== undefined && ![true, false, 'true', 'false'].includes(input.active)) throw new InventoryError('Estado no válido.');
  return {
    sku, name, category, material: material || null, size: size || null, lengthCm, thicknessMm, weightGrams,
    description: String(input.description ?? '').trim() || null, unit, stock, minStock, unitCost, salePrice,
    active: input.active === undefined || input.active === true || input.active === 'true',
  };
};

export class InventoryService {
  constructor(private db: Pick<typeof prisma, 'inventoryItem' | 'inventoryMovement'> = prisma,
    private uploadImages = subirMultiplesACloudinary,
    private transact: typeof stockTransaction = stockTransaction) {}

  private async images(input: InventoryItemDTO, files: ArchivoConBuffer[], existing?: { image: string | null; images: string[] }) {
    const direct = input.image?.trim();
    if (direct) imageUrl(direct);
    if (!files.length && existing && (!direct || direct === existing.image)) return existing.images.length ? existing.images : (existing.image ? [existing.image] : []);
    if (!files.length && !direct && !existing) return [];
    const uploaded = files.length ? await this.uploadImages(files) : [];
    return [...new Set([...uploaded, ...(direct ? [direct] : [])])];
  }

  async list() {
    return this.db.inventoryItem.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(input: InventoryItemDTO, files: ArchivoConBuffer[] = [], createdBy?: string) {
    const data = parseItem(input);
    const images = await this.images(input, files);
    try {
      return await this.db.inventoryItem.create({ data: { ...data, images, image: images[0] ?? null, movements: { create: { type: 'ADJUSTMENT', quantity: data.stock, previousStock: 0, resultingStock: data.stock, unitCost: data.unitCost, note: 'Stock inicial', createdBy } } } });
    } catch (error: any) {
      if (error.code === 'P2002') throw new InventoryError('El SKU ya existe.', 409);
      throw error;
    }
  }

  async update(id: string, input: InventoryItemDTO, files: ArchivoConBuffer[] = []) {
    const existing = await this.db.inventoryItem.findUnique({ where: { id } });
    if (!existing) throw new InventoryError('Artículo de inventario no encontrado.', 404);
    const data = parseItem({ ...input,
      sku: existing.sku,
      minStock: input.minStock === undefined ? existing.minStock.toString() : input.minStock,
      active: input.active === undefined ? existing.active : input.active,
      description: input.description === undefined ? existing.description ?? '' : input.description,
      lengthCm: input.lengthCm === undefined ? existing.lengthCm?.toString() : input.lengthCm,
      thicknessMm: input.thicknessMm === undefined ? existing.thicknessMm?.toString() : input.thicknessMm,
      weightGrams: input.weightGrams === undefined ? existing.weightGrams?.toString() : input.weightGrams,
    });
    const images = await this.images(input, files, existing);
    const { stock: _stock, ...details } = data;
    try {
      return await this.transact(tx => tx.inventoryItem.update({ where: { id }, data: { ...details, images, image: images[0] ?? null } }));
    } catch (error: any) {
      if (error.code === 'P2002') throw new InventoryError('El SKU ya existe.', 409);
      throw error;
    }
  }

  async addMovement(id: string, input: InventoryMovementDTO, createdBy?: string) {
    const type = String(input.type ?? '').toUpperCase() as InventoryMovementType;
    if (!movementTypes.includes(type)) throw new InventoryError('Tipo de movimiento no válido.');
    const quantity = parseNumber(input.quantity, 'La cantidad', 0.000001);
    if (type === 'SALE') throw new InventoryError('Registra las ventas desde la sección Ventas.');
    return this.transact(async transaction => {
      const item = await transaction.inventoryItem.findUnique({ where: { id } });
      if (!item) throw new InventoryError('Artículo de inventario no encontrado.', 404);
      const signedQuantity = new Prisma.Decimal(quantity).mul(['PURCHASE', 'RETURN'].includes(type) ? 1 : -1);
      const resultingStock = item.stock.add(signedQuantity);
      if (resultingStock.isNegative()) throw new InventoryError('El movimiento no puede dejar el stock en negativo.');
      const unitCost = input.unitCost === undefined || input.unitCost === '' ? item.unitCost : new Prisma.Decimal(parseNumber(input.unitCost, 'El costo unitario'));
      const movement = await transaction.inventoryMovement.create({ data: { itemId: id, type, quantity: signedQuantity, previousStock: item.stock, resultingStock, unitCost, note: String(input.note ?? '').trim() || null, createdBy } });
      const updated = await transaction.inventoryItem.update({ where: { id }, data: { stock: resultingStock, unitCost: type === 'PURCHASE' ? unitCost : item.unitCost } });
      return { item: updated, movement };
    });
  }

  async movements(id: string) {
    const item = await this.db.inventoryItem.findUnique({ where: { id }, select: { id: true } });
    if (!item) throw new InventoryError('Artículo de inventario no encontrado.', 404);
    return this.db.inventoryMovement.findMany({ where: { itemId: id }, orderBy: { createdAt: 'desc' } });
  }
}
