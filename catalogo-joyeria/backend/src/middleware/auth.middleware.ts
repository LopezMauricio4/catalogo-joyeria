import { createClient } from '@supabase/supabase-js';
import type { NextFunction, Request, Response } from 'express';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en backend/.env');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; role: 'ADMIN' | 'CLIENT' };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No has iniciado sesión.' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
  }

  req.user = {
    sub: data.user.id,
    role: data.user.app_metadata?.role === 'admin' ? 'ADMIN' : 'CLIENT',
  };

  return next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
  }
  return next();
};
