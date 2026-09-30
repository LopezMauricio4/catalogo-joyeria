import { Router } from 'express';
import { upload } from '../../middleware/upload.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware.js';
import { InventoryController } from './inventory.controller.js';

const router = Router();
const controller = new InventoryController();

router.use(requireAuth, requireAdmin);
router.get('/', controller.list);
router.post('/', upload.array('imagenes', 5), controller.create);
router.put('/:id', upload.array('imagenes', 5), controller.update);
router.get('/:id/movements', controller.movements);
router.post('/:id/movements', controller.movement);

export default router;
