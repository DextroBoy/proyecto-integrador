import { Request } from "express";

export type UserRole = "ADMIN" | "CLIENTE" | "AGENTE";

export interface AuthUser {
  identificacion: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

export type AuthenticatedRequest = Request & { user: AuthUser };