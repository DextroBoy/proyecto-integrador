import { PoolClient } from "pg";
import { pool } from "../../../config/database";
import { AuthUser, UserRole } from "../../../domain/interfaces/auth.interface";

export interface PersonRecord extends AuthUser {
  direccion: string;
  id_ciudad: number;
  puntos?: number;
  publicidad?: boolean;
  comision?: number;
  experiencia?: string | null;
  salario?: number;
  horario?: string | null;
}

export interface AccountInput {
  identificacion: number;
  nombre: string;
  direccion: string;
  email: string;
  password?: string;
  id_ciudad: number;
}

export class PersonModel {
  async getAll(role?: UserRole): Promise<PersonRecord[]> {
    const values = role ? [role] : [];
    const result = await pool.query<PersonRecord>(
      `SELECT p.num_identificacion::integer AS identificacion,
              p.nombre_completo AS nombre,
              p.correo_electronico AS email,
              p.rol, p.direccion, p.id_ciudad,
              c.puntos, c.publicidad, a.comision, a.experiencia, ad.salario, ad.horario
       FROM persona p
       LEFT JOIN cliente c ON c.num_identificacion = p.num_identificacion
       LEFT JOIN agente a ON a.num_identificacion = p.num_identificacion
       LEFT JOIN admin ad ON ad.num_identificacion = p.num_identificacion
       ${role ? "WHERE p.rol = $1" : ""} ORDER BY p.num_identificacion;`, values);
    return result.rows;
  }

  async getById(id: number, role?: UserRole): Promise<PersonRecord | null> {
    const rows = await this.getAll(role);
    return rows.find((person) => person.identificacion === id) ?? null;
  }

  async create(input: AccountInput, role: UserRole, hash: string): Promise<PersonRecord> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await this.insertPerson(client, input, role, hash);
      const accountTable = role === "CLIENTE" ? "cliente" : role === "AGENTE" ? "agente" : "admin";
      await client.query(
        `INSERT INTO ${accountTable} (num_identificacion) VALUES ($1)`,
        [String(input.identificacion)]
      );
      await client.query("COMMIT");
      return (await this.getById(input.identificacion, role))!;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
  }

  async update(id: number, input: Partial<AccountInput>, role: UserRole, hash?: string): Promise<PersonRecord | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const add = (field: string, value: unknown) => { fields.push(`${field} = $${values.length + 1}`); values.push(value); };
    if (input.nombre !== undefined) add("nombre_completo", input.nombre);
    if (input.direccion !== undefined) add("direccion", input.direccion);
    if (input.email !== undefined) add("correo_electronico", input.email);
    if (input.id_ciudad !== undefined) add("id_ciudad", input.id_ciudad);
    if (hash) add("contrasena", hash);
    if (fields.length) {
      values.push(id);
      await pool.query(
        `UPDATE persona SET ${fields.join(", ")}
         WHERE num_identificacion = $${values.length} AND rol = '${role}'`,
        values
      );
    }
    return this.getById(id, role);
  }

  async delete(id: number, role: UserRole): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "DELETE FROM persona WHERE num_identificacion = $1 AND rol = $2",
        [String(id), role]
      );
      await client.query("COMMIT");
      return result.rowCount !== 0;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
  }

  private async insertPerson(client: PoolClient, input: AccountInput, role: UserRole, hash: string): Promise<void> {
    await client.query(
      `INSERT INTO persona (
         num_identificacion, tipo_identificacion, nombre_completo, direccion,
         correo_electronico, contrasena, rol, id_ciudad
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        String(input.identificacion),
        "CC",
        input.nombre,
        input.direccion,
        input.email,
        hash,
        role,
        input.id_ciudad,
      ]);
  }
}