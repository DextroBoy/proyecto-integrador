import { pool } from "../../../config/database";
import { CustomError } from "../../../domain/errors/custom.error";

interface LoginUser {
  identificacion: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "CLIENTE" | "AGENTE";
}

export class AuthService {
  public async login(email: unknown, password: unknown): Promise<LoginUser> {
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      throw CustomError.badRequest("El correo y la contraseña son obligatorios.");
    }

    const result = await pool.query<LoginUser>(
      `SELECT identificacion, nombre, email, rol
       FROM persona
       WHERE LOWER(email) = LOWER($1) AND clave = $2;`,
      [email.trim(), password]
    );

    const user = result.rows[0];
    if (!user) {
      throw CustomError.unAuthorized("Correo o contraseña incorrectos.");
    }

    return user;
  }
}
