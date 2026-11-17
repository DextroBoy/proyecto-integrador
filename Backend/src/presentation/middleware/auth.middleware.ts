import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../../domain/errors/custom.error";
import { AuthUser, AuthenticatedRequest, UserRole } from "../../domain/interfaces/auth.interface";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET es obligatorio y no debe estar en el repositorio.");
}
const jwtSecret: string = secret;

export function signToken(user: AuthUser): string {
  return jwt.sign(user, jwtSecret, { expiresIn: "8h" });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw CustomError.unAuthorized("Se requiere un token de acceso.");
    }
    const payload = jwt.verify(header.slice(7), jwtSecret) as Partial<AuthUser>;
    if (!payload.identificacion || !payload.rol || !payload.email || !payload.nombre) {
      throw CustomError.unAuthorized("El token no contiene una identidad válida.");
    }
    (req as AuthenticatedRequest).user = payload as AuthUser;
    next();
  } catch (error) {
    next(error instanceof Error && "statusCode" in error
      ? error
      : CustomError.unAuthorized("El token de acceso no es válido o expiró."));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as Partial<AuthenticatedRequest>).user;
    if (!user || !roles.includes(user.rol)) {
      next(CustomError.forbidden("No tienes permisos para realizar esta operación."));
      return;
    }
    next();
  };
}

export function currentUser(req: Request): AuthUser {
  return (req as AuthenticatedRequest).user;
}