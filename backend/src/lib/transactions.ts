import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';

// All stock writers share Serializable transactions and retry serialization conflicts.
export async function stockTransaction<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await prisma.$transaction(operation, { isolationLevel: 'Serializable', timeout: 20000 }); }
    catch (error: any) {
      if (error.code === 'P2034' && attempt < 3) continue;
      if (error.code === 'P2034') throw Object.assign(new Error('El inventario cambió mientras guardabas. Intenta nuevamente.'), { status: 409 });
      throw error;
    }
  }
}
