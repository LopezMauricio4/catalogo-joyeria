import type { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import type { ArchivoConBuffer } from './product.types.js';

const productService = new ProductService();
const files = (req: Request) => Array.isArray(req.files) ? req.files as ArchivoConBuffer[] : [];
const id = (req: Request) => String(req.params.id);
export class ProductController {
  crear = async (req: Request, res: Response) => {
    const product = await productService.crearProducto(req.body, files(req));
    res.status(201).json({ ok: true, product });
  };
  actualizar = async (req: Request, res: Response) => {
    const product = await productService.actualizarProducto(id(req), req.body, files(req));
    res.json({ ok: true, product });
  };
  listar = async (_req: Request, res: Response) => {
    res.json(await productService.obtenerProductos());
  };
  listarAdmin = async (_req: Request, res: Response) => {
    res.set('Cache-Control', 'no-store');
    res.json(await productService.obtenerProductosAdmin());
  };
  visibilidad = async (req: Request, res: Response) => {
    res.json({ ok: true, product: await productService.cambiarVisibilidad(id(req), req.body?.visible) });
  };
  eliminar = async (req: Request, res: Response) => {
    res.json({ ok: true, product: await productService.eliminarProducto(id(req)) });
  };
}
