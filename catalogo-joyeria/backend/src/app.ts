import 'dotenv/config';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import productRoutes from './modules/products/product.routes.js';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, message: 'Backend funcionando correctamente.' });
});

app.use('/api/products', productRoutes);

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled backend error:', error);

  const status = error.statusCode || error.status || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(status).json({
    ok: false,
    message,
  });
});

export default app;
