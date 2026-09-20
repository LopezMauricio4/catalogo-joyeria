import { prisma } from '../../lib/prisma.js';
import { eliminarMultiplesDeCloudinary, subirMultiplesACloudinary } from '../../cloudinary.js';
import { ArchivoConBuffer, CrearProductoDTO, ProductRecord, ProductoRespuesta } from './product.types.js';

const parseFeatures = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.map((feature) => feature.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((feature) => feature.trim())
      .filter(Boolean);
  }

  return [];
};

const sanitizeProduct = (product: any): ProductRecord => ({
  id: product.id,
  name: product.name,
  description: product.description ?? null,
  price: Number(product.price),
  material: product.material,
  category: product.category,
  image: product.image ?? product.images?.[0] ?? null,
  images: Array.isArray(product.images) ? product.images : [],
  features: Array.isArray(product.features) ? product.features : [],
  stock: Number(product.stock ?? 10),
  featured: Boolean(product.featured),
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export class ProductService {
  public async crearProducto(
    datos: CrearProductoDTO,
    archivos: ArchivoConBuffer[] = [],
  ): Promise<ProductoRespuesta> {
    const name = String(datos.name ?? '').trim();
    const description = typeof datos.description === 'string' ? datos.description.trim() : '';
    const material = String(datos.material ?? '').trim();
    const category = String(datos.category ?? '').trim();
    const price = Number(datos.price);
    const stock = Number(datos.stock ?? 10);
    const featured = String(datos.featured ?? 'false') === 'true';

    if (!name) {
      throw new Error('El nombre del producto es obligatorio.');
    }

    if (!material) {
      throw new Error('Debes indicar el material del producto.');
    }

    if (!category) {
      throw new Error('Debes indicar la categoría del producto.');
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('El precio debe ser un número mayor a 0.');
    }

    const uploadedUrls = archivos.length > 0 ? await subirMultiplesACloudinary(archivos) : [];
    const directImage = typeof datos.image === 'string' ? datos.image.trim() : '';
    const images = [...uploadedUrls, ...(directImage ? [directImage] : [])].filter(Boolean);
    const image = images[0] ?? null;

    const nuevoProducto = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        material,
        category,
        image,
        images,
        features: parseFeatures(datos.features),
        stock: Number.isFinite(stock) ? stock : 10,
        featured,
      },
    });

    return sanitizeProduct(nuevoProducto);
  }

  public async obtenerProductos(): Promise<ProductoRespuesta[]> {
    const productos = (await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })) as any[];

    return productos.map((producto: any) => sanitizeProduct(producto));
  }

  public async eliminarProducto(id: string): Promise<ProductoRespuesta> {
    const producto = await prisma.product.findUnique({ where: { id } });

    if (!producto) {
      throw new Error('Producto no encontrado.');
    }

    const urlsParaEliminar = [producto.image, ...(Array.isArray(producto.images) ? producto.images : [])];

    await eliminarMultiplesDeCloudinary(urlsParaEliminar);

    const productoEliminado = await prisma.product.delete({ where: { id } });

    return sanitizeProduct(productoEliminado);
  }
}