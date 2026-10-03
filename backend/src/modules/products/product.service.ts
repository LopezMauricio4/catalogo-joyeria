import { prisma } from '../../lib/prisma.js';
import { subirMultiplesACloudinary } from '../../cloudinary.js';
import type { ArchivoConBuffer, CrearProductoDTO, ProductoRespuesta } from './product.types.js';
import { presentProduct } from './availability.js';

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
  const material = String(datos.material ?? '');
  const category = String(datos.category ?? '');
  if (!name) throw new ProductError('El nombre es obligatorio.');
  if (!Number.isFinite(price) || price <= 0) throw new ProductError('El precio debe ser mayor a 0.');
  if (!materials.includes(material)) throw new ProductError('Material no válido.');
  if (!categories.includes(category)) throw new ProductError('Categoría no válida.');
  if (datos.featured !== undefined && ![true, false, 'true', 'false'].includes(datos.featured)) throw new ProductError('Destacado no válido.');
  const features = (Array.isArray(datos.features) ? datos.features : String(datos.features ?? '').split(','))
    .map((item) => String(item).trim()).filter(Boolean);
  return { name, description: description || null, price, material, category,
    featured: datos.featured === true || datos.featured === 'true', features };
};

export class ProductService {
  constructor(private db: Pick<typeof prisma, 'product'> = prisma,
    private uploadImages = subirMultiplesACloudinary) {}

  private async images(datos: CrearProductoDTO, files: ArchivoConBuffer[], existing?: ProductoRespuesta) {
    const direct = datos.image?.trim();
    if (direct) imageUrl(direct);
    const current = [...new Set([existing?.image, ...(existing?.images || [])].filter((url): url is string => Boolean(url)))];
    let removed: unknown = datos.removedImages ?? [];
    if (typeof removed === 'string') {
      try { removed = JSON.parse(removed); }
      catch { throw new ProductError('La selección de imágenes a eliminar no es válida.'); }
    }
    if (!Array.isArray(removed) || removed.some(url => typeof url !== 'string' || !current.includes(url))) throw new ProductError('Solo puedes quitar imágenes actuales de este producto.');
    const retained = current.filter(url => !(removed as string[]).includes(url));
    const linked = [...new Set([...retained, ...(direct ? [direct] : [])])];
    if (linked.length + files.length > 5) throw new ProductError('El producto puede tener hasta 5 imágenes. Quita alguna antes de agregar más.');
    if (!files.length && !linked.length) throw new ProductError('Debes conservar o agregar al menos una imagen.');
    const references = [...linked, ...files.map((_, index) => `new:${index}`)];
    let order: unknown = datos.imageOrder ?? references;
    if (typeof order === 'string') {
      try { order = JSON.parse(order); }
      catch { throw new ProductError('El orden de las imágenes no es válido.'); }
    }
    if (!Array.isArray(order) || order.length !== references.length || new Set(order).size !== order.length || order.some(ref => typeof ref !== 'string' || !references.includes(ref))) throw new ProductError('El orden debe incluir cada imagen del producto una sola vez.');
    const uploaded = files.length ? await this.uploadImages(files) : [];
    const urls = new Map([...linked.map(url => [url, url] as const), ...uploaded.map((url, index) => [`new:${index}`, url] as const)]);
    return [...new Set((order as string[]).map(ref => urls.get(ref)!))];
  }

  async crearProducto(datos: CrearProductoDTO, files: ArchivoConBuffer[] = []): Promise<ProductoRespuesta> {
    const data = parseData(datos);
    const images = await this.images(datos, files);
    return presentProduct(await this.db.product.create({ data: { ...data, images, image: images[0] } }));
  }

  async actualizarProducto(id: string, datos: CrearProductoDTO, files: ArchivoConBuffer[] = []): Promise<ProductoRespuesta> {
    const existing = await this.db.product.findUnique({ where: { id } });
    if (!existing) throw new ProductError('Producto no encontrado.', 404);
    const data = parseData(datos);
    const images = await this.images(datos, files, existing);
    return presentProduct(await this.db.product.update({ where: { id }, data: { ...data, images, image: images[0] } }));
  }

  async obtenerProductos(): Promise<ProductoRespuesta[]> {
    return (await this.db.product.findMany({ where: { visible: true }, orderBy: { createdAt: 'desc' } })).map(product => presentProduct(product));
  }

  async obtenerProductosAdmin(): Promise<ProductoRespuesta[]> {
    return (await this.db.product.findMany({ orderBy: { createdAt: 'desc' } })).map(product => presentProduct(product));
  }

  async cambiarVisibilidad(id: string, visible: unknown): Promise<ProductoRespuesta> {
    if (typeof visible !== 'boolean') throw new ProductError('La visibilidad debe ser true o false.');
    try {
      return presentProduct(await this.db.product.update({ where: { id }, data: { visible } }));
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
