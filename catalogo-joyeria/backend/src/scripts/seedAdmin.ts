/**
 * Crea (o actualiza la contraseña de) el usuario administrador.
 * El registro público (POST /api/auth/register) SIEMPRE crea clientes;
 * este script es la única forma de tener una cuenta ADMIN.
 *
 * Uso:
 *   npx tsx src/scripts/seedAdmin.ts admin@alpez.com "unaContraseñaFuerte123"
 *
 * O usando variables de entorno:
 *   ADMIN_EMAIL=admin@alpez.com ADMIN_PASSWORD=unaContraseñaFuerte123 npx tsx src/scripts/seedAdmin.ts
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

async function main() {
  if (!email || !password) {
    console.error('Faltan el correo y/o la contraseña. Revisa el comentario de uso en este archivo.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN' },
    create: { name: 'Administrador', email, passwordHash, role: 'ADMIN' },
  });

  console.log(`Usuario administrador listo: ${admin.email}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
