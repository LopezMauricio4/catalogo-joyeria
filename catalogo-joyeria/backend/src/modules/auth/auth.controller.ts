import type { Request, Response } from 'express';
import { AuthError, AuthService } from './auth.service.js';

const authService = new AuthService();

export const SESSION_COOKIE_NAME = 'alpez_session';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true, // el JS del navegador NO puede leer esta cookie — así se cierra el hueco de localStorage
  secure: isProduction, // en producción solo viaja por HTTPS
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días, en milisegundos — debe coincidir con JWT_EXPIRES_IN
  path: '/',
};

const handleAuthError = (error: unknown, res: Response) => {
  if (error instanceof AuthError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Ocurrió un error inesperado.' });
};

export class AuthController {
  register = async (req: Request, res: Response) => {
    try {
      const user = await authService.register(req.body);
      const token = authService.signToken({ sub: user.id, role: user.role });
      res.cookie(SESSION_COOKIE_NAME, token, cookieOptions);
      res.status(201).json({ user });
    } catch (error) {
      handleAuthError(error, res);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const user = await authService.login(req.body);
      const token = authService.signToken({ sub: user.id, role: user.role });
      res.cookie(SESSION_COOKIE_NAME, token, cookieOptions);
      res.status(200).json({ user });
    } catch (error) {
      handleAuthError(error, res);
    }
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    res.status(200).json({ message: 'Sesión cerrada.' });
  };

  me = async (req: Request, res: Response) => {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ user: null });
    }

    const user = await authService.getById(userId);
    if (!user) {
      res.clearCookie(SESSION_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
      return res.status(401).json({ user: null });
    }

    return res.status(200).json({ user });
  };
}
