import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { upload } from '../../middleware/upload.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();
const productController = new ProductController();

// Lectura — pública, cualquiera puede ver el catálogo
router.get('/', productController.listar);

// Escritura — antes estaban abiertas a cualquiera que conociera la URL.
// Ahora exigen sesión válida (requireAuth) Y rol ADMIN (requireAdmin).
router.post('/', requireAuth, requireAdmin, upload.array('imagenes', 5), productController.crear);
router.put('/:id', requireAuth, requireAdmin, upload.array('imagenes', 5), productController.actualizar);
router.delete('/:id', requireAuth, requireAdmin, productController.eliminar);

export default router;
