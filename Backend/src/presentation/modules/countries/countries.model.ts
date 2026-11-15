import { PoolClient } from "pg";
import { pool } from "../../../config/database";
import {
  LocationDeleteResult,
  translateLocationDatabaseError,
} from "../locations/locations.shared";

export interface Country {
  id: number;
  nombre: string;
}

export class CountriesModel {
  async getAll(): Promise<Country[]> {
    const result = await pool.query<Country>(
      "SELECT id, nombre FROM pais ORDER BY nombre, id;"
    );
    return result.rows;
  }

  async getById(id: number): Promise<Country | null> {
    const result = await pool.query<Country>(
      "SELECT id, nombre FROM pais WHERE id = $1;",
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(nombre: string): Promise<Country> {
    try {
      const result = await pool.query<Country>(
        "INSERT INTO pais (nombre) VALUES ($1) RETURNING id, nombre;",
        [nombre]
      );
      const country = result.rows[0];
      if (!country) {
        throw new Error("No se pudo recuperar el país creado.");
      }
      return country;
    } catch (error) {
      translateLocationDatabaseError(error);
    }
  }

  async update(id: number, nombre: string): Promise<Country | null> {
    try {
      const result = await pool.query<Country>(
        "UPDATE pais SET nombre = $1 WHERE id = $2 RETURNING id, nombre;",
        [nombre, id]
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
      const country = await client.query(
        "SELECT id FROM pais WHERE id = $1 FOR UPDATE;",
        [id]
      );
      if (country.rowCount === 0) {
        await client.query("COMMIT;");
        return "not-found";
      }

      const departments = await client.query(
        "SELECT 1 FROM departamento WHERE id_pais = $1 LIMIT 1;",
        [id]
      );
      if (departments.rowCount !== 0) {
        await client.query("COMMIT;");
        return "in-use";
      }

      await client.query("DELETE FROM pais WHERE id = $1;", [id]);
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
