import { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { ArchivoConBuffer } from './product.types.js';

const productService = new ProductService();

export class ProductController {
  public crear = async (req: Request, res: Response): Promise<any> => {
    try {
      const files = Array.isArray(req.files) ? (req.files as ArchivoConBuffer[]) : [];
      const { name, description, price, material, category, stock, featured, features, image } = req.body;

      const imageUrl = typeof image === 'string' ? image.trim() : '';
      if (!files.length && !imageUrl) {
        return res.status(400).json({
          ok: false,
          message: 'Debes subir al menos una imagen o indicar una URL de imagen.',
        });
      }

      const productoCreado = await productService.crearProducto(
        {
          name,
          description,
          price,
          material,
          category,
          stock,
          featured,
          features,
          image: imageUrl,
        },
        files,
      );

      return res.status(201).json({
        ok: true,
        message: 'Producto creado correctamente.',
        product: productoCreado,
      });
    } catch (error: any) {
      console.error('Error al crear el producto:', error);
      return res.status(400).json({
        ok: false,
        message: error.message || 'Error interno al procesar el producto',
      });
    }
  };

  public listar = async (_req: Request, res: Response): Promise<any> => {
    try {
      const productos = await productService.obtenerProductos();
      return res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      return res.status(500).json({ ok: false, message: 'Error al obtener el catálogo' });
    }
  };

  public eliminar = async (req: Request, res: Response): Promise<any> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const productoEliminado = await productService.eliminarProducto(id);

      return res.status(200).json({
        ok: true,
        message: 'Producto eliminado correctamente.',
        product: productoEliminado,
      });
    } catch (error: any) {
      console.error('Error al eliminar el producto:', error);
      return res.status(400).json({
        ok: false,
        message: error.message || 'Error al eliminar el producto',
      });
    }
  };
}