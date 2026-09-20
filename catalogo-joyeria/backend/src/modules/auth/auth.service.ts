import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import type { AuthTokenPayload, LoginInput, PublicUser, RegisterInput } from './auth.types.js';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  // Falla rápido en arranque en vez de firmar tokens con un secreto vacío/adivinable.
  throw new Error('Falta la variable de entorno JWT_SECRET. Revisa backend/.env');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}

const toPublicUser = (user: { id: string; name: string; email: string; role: string }): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as PublicUser['role'],
});

export class AuthService {
  async register(input: RegisterInput): Promise<PublicUser> {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password ?? '';

    if (!name || !email || !password) {
      throw new AuthError('Nombre, correo y contraseña son obligatorios.');
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new AuthError('El correo electrónico no es válido.');
    }
    if (password.length < 8) {
      throw new AuthError('La contraseña debe tener al menos 8 caracteres.');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AuthError('Ya existe una cuenta con ese correo.', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // El registro público SIEMPRE crea clientes. El rol ADMIN nunca se asigna
    // desde este endpoint — se crea aparte (ver seed-admin.ts) para que nadie
    // pueda auto-otorgarse permisos de administrador vía la API.
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'CLIENT' },
    });

    return toPublicUser(user);
  }

  async login(input: LoginInput): Promise<PublicUser> {
    const email = input.email?.trim().toLowerCase();
    const password = input.password ?? '';

    if (!email || !password) {
      throw new AuthError('Correo y contraseña son obligatorios.');
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Mensaje genérico a propósito: no revelamos si falló el correo o la
    // contraseña, para no ayudar a alguien a enumerar cuentas existentes.
    if (!user) {
      throw new AuthError('Credenciales incorrectas.', 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new AuthError('Credenciales incorrectas.', 401);
    }

    return toPublicUser(user);
  }

  async getById(userId: string): Promise<PublicUser | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? toPublicUser(user) : null;
  }

  signToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, JWT_SECRET as string) as AuthTokenPayload;
  }
}
