import { pool } from "../../../config/database";
import { CustomError } from "../../../domain/errors/custom.error";
import { AuthUser } from "../../../domain/interfaces/auth.interface";
import bcrypt from "bcryptjs";
import { signToken } from "../../middleware/auth.middleware";

const MAX_POSTGRES_INTEGER = 2_147_483_647;

export interface RegisterInput { identificacion: unknown; nombre: unknown; direccion: unknown; email: unknown; password: unknown; id_ciudad: unknown; }

export class AuthService {
  public async login(email: unknown, password: unknown): Promise<{ user: AuthUser; token: string }> {
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      throw CustomError.badRequest("El correo y la contraseña son obligatorios.");
    }

    const result = await pool.query<AuthUser & { clave: string }>(
      `SELECT num_identificacion::integer AS identificacion,
              nombre_completo AS nombre,
              correo_electronico AS email,
              rol,
              contrasena AS clave
       FROM persona
      WHERE LOWER(correo_electronico) = LOWER($1);`,
      [email.trim()]
    );

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.clave))) {
      throw CustomError.unAuthorized("Correo o contraseña incorrectos.");
    }

    const { clave: _clave, ...safeUser } = user;
    return { user: safeUser, token: signToken(safeUser) };
  }

  public async register(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
    const values = [input.identificacion, input.nombre, input.direccion, input.email, input.password, input.id_ciudad];
    if (!Number.isSafeInteger(Number(input.identificacion)) || Number(input.identificacion) < 1 ||
      Number(input.identificacion) > MAX_POSTGRES_INTEGER ||
      typeof input.nombre !== "string" || !input.nombre.trim() || typeof input.direccion !== "string" || !input.direccion.trim() ||
      typeof input.email !== "string" || !/^\S+@\S+\.\S+$/.test(input.email) || typeof input.password !== "string" || input.password.length < 6 ||
      !Number.isSafeInteger(Number(input.id_ciudad)) || Number(input.id_ciudad) < 1 ||
      Number(input.id_ciudad) > MAX_POSTGRES_INTEGER) {
      throw CustomError.badRequest("Identificación, nombre, dirección, correo, contraseña y ciudad son obligatorios y válidos.");
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const hash = await bcrypt.hash(input.password, 12);
      const inserted = await client.query<AuthUser>(
        `INSERT INTO persona (
           num_identificacion, tipo_identificacion, nombre_completo, direccion,
           correo_electronico, contrasena, rol, id_ciudad
         )
         VALUES ($1, 'CC', $2, $3, $4, $5, 'CLIENTE', $6)
         RETURNING num_identificacion::integer AS identificacion,
                   nombre_completo AS nombre, correo_electronico AS email, rol`,
        [
          String(input.identificacion),
          input.nombre.trim(),
          input.direccion.trim(),
          input.email.trim().toLowerCase(),
          hash,
          Number(input.id_ciudad),
        ]);
      await client.query(
        "INSERT INTO cliente (num_identificacion) VALUES ($1)",
        [String(input.identificacion)]
      );
      await client.query("COMMIT");
      const user = inserted.rows[0];
      if (!user) throw CustomError.internalServer("No se pudo crear la cuenta.");
      return { user, token: signToken(user) };
    } catch (error) {
      await client.query("ROLLBACK");
      if ((error as { code?: string }).code === "23505") throw CustomError.conflict("La identificación o el correo ya están registrados.");
      throw error;
    } finally { client.release(); }
  }
}
