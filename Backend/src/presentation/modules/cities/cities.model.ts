import { PoolClient } from "pg";
import { pool } from "../../../config/database";
import {
  LocationDeleteResult,
  translateLocationDatabaseError,
} from "../locations/locations.shared";

export interface City {
  id: number;
  id_departamento: number;
  nombre: string;
}

export class CitiesModel {
  async getAll(departmentId?: number): Promise<City[]> {
    const result = departmentId === undefined
      ? await pool.query<City>(
          "SELECT id, id_departamento, nombre FROM ciudad ORDER BY nombre, id;"
        )
      : await pool.query<City>(
          "SELECT id, id_departamento, nombre FROM ciudad WHERE id_departamento = $1 ORDER BY nombre, id;",
          [departmentId]
        );
    return result.rows;
  }

  async getById(id: number): Promise<City | null> {
    const result = await pool.query<City>(
      "SELECT id, id_departamento, nombre FROM ciudad WHERE id = $1;",
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(departmentId: number, nombre: string): Promise<City> {
    try {
      const result = await pool.query<City>(
        `INSERT INTO ciudad (id_departamento, nombre)
         VALUES ($1, $2)
         RETURNING id, id_departamento, nombre;`,
        [departmentId, nombre]
      );
      const city = result.rows[0];
      if (!city) {
        throw new Error("No se pudo recuperar la ciudad creada.");
      }
      return city;
    } catch (error) {
      translateLocationDatabaseError(error);
    }
  }

  async update(id: number, departmentId: number, nombre: string): Promise<City | null> {
    try {
      const result = await pool.query<City>(
        `UPDATE ciudad
         SET id_departamento = $1, nombre = $2
         WHERE id = $3
         RETURNING id, id_departamento, nombre;`,
        [departmentId, nombre, id]
      );
      return result.rows[0] ?? null;
    } catch (error) {
      translateLocationDatabaseError(error);
    }
  }

  async deleteIfUnused(id: number): Promise<LocationDeleteResult> {
    const client: PoolClient = await pool.connect();
    try {
      await client.query("BEGIN;");
      const city = await client.query(
        "SELECT id FROM ciudad WHERE id = $1 FOR UPDATE;",
        [id]
      );
      if (city.rowCount === 0) {
        await client.query("COMMIT;");
        return "not-found";
      }

      const dependents = await client.query(
        `SELECT 1
         FROM persona
         WHERE id_ciudad = $1
         UNION ALL
         SELECT 1
         FROM evento
         WHERE id_ciudad = $1
         LIMIT 1;`,
        [id]
      );
      if (dependents.rowCount !== 0) {
        await client.query("COMMIT;");
        return "in-use";
      }

      await client.query("DELETE FROM ciudad WHERE id = $1;", [id]);
      await client.query("COMMIT;");
      return "deleted";
    } catch (error) {
      await client.query("ROLLBACK;");
      throw error;
    } finally {
      client.release();
    }
  }
}
