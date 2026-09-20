import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
