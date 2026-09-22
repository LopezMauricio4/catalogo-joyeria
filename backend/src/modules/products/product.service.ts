import { prisma } from '../../lib/prisma.js';
import { subirMultiplesACloudinary } from '../../cloudinary.js';
import type { ArchivoConBuffer, CrearProductoDTO, ProductoRespuesta } from './product.types.js';

export class ProductError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const materials = ['oro-18k', 'laminado'];
const categories = ['anillos', 'cadenas', 'pulseras', 'manillas', 'topos'];
const imageUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return value;
  } catch { throw new ProductError('La imagen debe ser una URL HTTP o HTTPS válida.'); }
};
const parseData = (datos: CrearProductoDTO) => {
  const name = String(datos.name ?? '').trim();
  const description = String(datos.description ?? '').trim();
  const price = Number(datos.price);
  const stock = Number(datos.stock ?? 10);
  const material = String(datos.material ?? '');
  const category = String(datos.category ?? '');
  if (!name) throw new ProductError('El nombre es obligatorio.');
  if (!Number.isFinite(price) || price <= 0) throw new ProductError('El precio debe ser mayor a 0.');
  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 2147483647) throw new ProductError('El stock debe ser un entero válido igual o mayor a 0.');
  if (!materials.includes(material)) throw new ProductError('Material no válido.');
  if (!categories.includes(category)) throw new ProductError('Categoría no válida.');
  if (datos.featured !== undefined && ![true, false, 'true', 'false'].includes(datos.featured)) throw new ProductError('Destacado no válido.');
  const features = (Array.isArray(datos.features) ? datos.features : String(datos.features ?? '').split(','))
    .map((item) => String(item).trim()).filter(Boolean);
  return { name, description: description || null, price, stock, material, category,
    featured: datos.featured === true || datos.featured === 'true', features };
};

export class ProductService {
  constructor(private db: Pick<typeof prisma, 'product'> = prisma,
    private uploadImages = subirMultiplesACloudinary) {}

  private async images(datos: CrearProductoDTO, files: ArchivoConBuffer[], existing?: ProductoRespuesta) {
    const direct = datos.image?.trim();
    if (direct) imageUrl(direct);
    // Una edición de texto conserva toda la galería existente.
    if (!files.length && existing && (!direct || direct === existing.image)) return existing.images.length ? existing.images : [existing.image!];
    if (!files.length && !direct) throw new ProductError('Debes indicar al menos una imagen.');
    const uploaded = files.length ? await this.uploadImages(files) : [];
    return [...new Set([...uploaded, ...(direct ? [direct] : [])])];
  }

  async crearProducto(datos: CrearProductoDTO, files: ArchivoConBuffer[] = []): Promise<ProductoRespuesta> {
    const data = parseData(datos);
    const images = await this.images(datos, files);
    return this.db.product.create({ data: { ...data, images, image: images[0] } });
  }

  async actualizarProducto(id: string, datos: CrearProductoDTO, files: ArchivoConBuffer[] = []): Promise<ProductoRespuesta> {
    const existing = await this.db.product.findUnique({ where: { id } });
    if (!existing) throw new ProductError('Producto no encontrado.', 404);
    const data = parseData(datos);
    const images = await this.images(datos, files, existing);
    return this.db.product.update({ where: { id }, data: { ...data, images, image: images[0] } });
  }

  async obtenerProductos(): Promise<ProductoRespuesta[]> {
    return this.db.product.findMany({ where: { visible: true }, orderBy: { createdAt: 'desc' } });
  }

  async obtenerProductosAdmin(): Promise<ProductoRespuesta[]> {
    return this.db.product.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async cambiarVisibilidad(id: string, visible: unknown): Promise<ProductoRespuesta> {
    if (typeof visible !== 'boolean') throw new ProductError('La visibilidad debe ser true o false.');
    try {
      return await this.db.product.update({ where: { id }, data: { visible } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new ProductError('Producto no encontrado.', 404);
      throw error;
    }
  }

  async eliminarProducto(id: string): Promise<ProductoRespuesta> {
    try {
      // No borrar recursos de Cloudinary que puedan estar compartidos por otros productos.
      return await this.db.product.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new ProductError('Producto no encontrado.', 404);
      throw error;
    }
  }
}
