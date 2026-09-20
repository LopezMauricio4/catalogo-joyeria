import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('La variable DATABASE_URL no está definida. Revisa tu archivo .env del backend.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };
