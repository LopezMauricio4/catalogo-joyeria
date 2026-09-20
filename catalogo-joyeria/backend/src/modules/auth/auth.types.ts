export type UserRole = 'ADMIN' | 'CLIENT';

export interface AuthTokenPayload {
  sub: string; // user id
  role: UserRole;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Lo que se expone al frontend — nunca el passwordHash.
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
