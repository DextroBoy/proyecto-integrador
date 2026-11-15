import { PoolClient } from "pg";
import { pool } from "../../../config/database";
import {
  LocationDeleteResult,
  translateLocationDatabaseError,
} from "../locations/locations.shared";

export interface Department {
  id: number;
  id_pais: number;
  nombre: string;
}

export class DepartmentsModel {
  async getAll(countryId?: number): Promise<Department[]> {
    const result = countryId === undefined
      ? await pool.query<Department>(
          "SELECT id, id_pais, nombre FROM departamento ORDER BY nombre, id;"
        )
      : await pool.query<Department>(
          "SELECT id, id_pais, nombre FROM departamento WHERE id_pais = $1 ORDER BY nombre, id;",
          [countryId]
        );
    return result.rows;
  }

  async getById(id: number): Promise<Department | null> {
    const result = await pool.query<Department>(
      "SELECT id, id_pais, nombre FROM departamento WHERE id = $1;",
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(countryId: number, nombre: string): Promise<Department> {
    try {
      const result = await pool.query<Department>(
        `INSERT INTO departamento (id_pais, nombre)
         VALUES ($1, $2)
         RETURNING id, id_pais, nombre;`,
        [countryId, nombre]
      );
      const department = result.rows[0];
      if (!department) {
        throw new Error("No se pudo recuperar el departamento creado.");
      }
      return department;
    } catch (error) {
      translateLocationDatabaseError(error);
    }
  }

  async update(id: number, countryId: number, nombre: string): Promise<Department | null> {
    try {
      const result = await pool.query<Department>(
        `UPDATE departamento
         SET id_pais = $1, nombre = $2
         WHERE id = $3
         RETURNING id, id_pais, nombre;`,
        [countryId, nombre, id]
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
      const department = await client.query(
        "SELECT id FROM departamento WHERE id = $1 FOR UPDATE;",
        [id]
      );
      if (department.rowCount === 0) {
        await client.query("COMMIT;");
        return "not-found";
      }

      const cities = await client.query(
        "SELECT 1 FROM ciudad WHERE id_departamento = $1 LIMIT 1;",
        [id]
      );
      if (cities.rowCount !== 0) {
        await client.query("COMMIT;");
        return "in-use";
      }

      await client.query("DELETE FROM departamento WHERE id = $1;", [id]);
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
