import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware.js';
import { SalesService } from './sales.service.js';

const router = Router();
const service = new SalesService();
router.use(requireAuth, requireAdmin);
router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.get('/', async (req, res) => {
  const page = Math.max(1, Math.min(100000, Math.floor(Number(req.query.page) || 1)));
  res.json(await service.list(page));
});
router.post('/', async (req, res) => {
  res.status(201).json({ ok: true, sale: await service.create(req.body, req.user!) });
});
export default router;
