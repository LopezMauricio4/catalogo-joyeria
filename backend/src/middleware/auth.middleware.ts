import type { NextFunction, Request, Response } from 'express';
import { getSupabase } from '../lib/supabase.js';

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; role: 'ADMIN' | 'CLIENT' };
    }
  }
}

export const createRequireAuth = (getClient = getSupabase) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) return res.status(401).json({ message: 'No has iniciado sesión.' });
    try {
      const { data, error } = await getClient().auth.getUser(token);
      if (error || !data.user) {
        return res.status(401).json({ message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
      }
      req.user = {
        sub: data.user.id,
        role: data.user.app_metadata?.role === 'admin' ? 'ADMIN' : 'CLIENT',
      };
      return next();
    } catch (error) {
      return next(error);
    }
  };

export const requireAuth = createRequireAuth();
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
  }
  return next();
};
