import 'dotenv/config';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import productRoutes from './modules/products/product.routes.js';
import { prisma } from './lib/prisma.js';
import { MulterError } from 'multer';

const app = express();

app.use(
  cors({
    origin: (process.env.FRONTEND_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value => value.trim()),
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, message: 'Backend funcionando correctamente.' });
});

app.get('/api/health/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.product.count();
    res.json({
      ok: true,
      database: 'connected',
      configuration: {
        databaseUrl: Boolean(process.env.DATABASE_URL),
        supabaseUrl: Boolean(process.env.SUPABASE_URL),
        supabaseAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
      },
    });
  } catch {
    res.status(503).json({
      ok: false,
      database: 'unavailable',
      configuration: { databaseUrl: Boolean(process.env.DATABASE_URL) },
    });
  }
});

app.use('/api/products', productRoutes);

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = error instanceof MulterError ? 400 : error.statusCode || error.status || 500;
  const message = status < 500 || status === 503 ? error.message : 'Error interno del servidor. Intenta nuevamente.';
  if (status >= 500) console.error('Backend error:', error.code || error.name);

  res.status(status).json({
    ok: false,
    message,
  });
});

export default app;
