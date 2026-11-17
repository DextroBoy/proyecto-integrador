import { PoolClient } from "pg";
import { pool } from "../../../config/database";
import { CustomError } from "../../../domain/errors/custom.error";

export interface EventRecord {
  id: number;
  identificacion: number;
  id_ciudad: number;
  nombre: string;
  descripcion: string;
  teatro: string;
  ciudad: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad: number;
  precio: number;
  observacion: string | null;
  estado: string;
}

export interface EventData {
  identificacion: number;
  id_ciudad: number;
  nombre: string;
  teatro: string;
  capacidad: number;
  descripcion: string;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  observacion: string | null;
  estado: string;
}

export type EventDeleteResult = "deleted" | "not-found" | "forbidden" | "has-reservations";

const EVENT_SELECT = `
  SELECT e.id, e.identificacion, e.id_ciudad, e.nombre, e.descripcion,
         e.teatro, c.nombre AS ciudad, e.fecha_inicio::text, e.fecha_fin::text,
         e.capacidad, e.precio, e.observacion, e.estado
  FROM evento e
  INNER JOIN ciudad c ON c.id = e.id_ciudad`;

function translateEventDatabaseError(error: unknown): never {
  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;
    if (code === "23505") {
      throw CustomError.conflict("Ya existe un evento con esos datos.");
    }
    if (code === "23503") {
      throw CustomError.badRequest("El agente o la ciudad indicada ya no existe.");
    }
    if (code === "23514" || code === "22001" || code === "22003" || code === "22P02") {
      throw CustomError.badRequest("Los datos del evento no cumplen las restricciones.");
    }
  }
  throw error;
}

export class EventsModel {
  async getAll(agentId?: number): Promise<EventRecord[]> {
    const result = agentId === undefined
      ? await pool.query<EventRecord>(`${EVENT_SELECT} ORDER BY e.fecha_inicio, e.id;`)
      : await pool.query<EventRecord>(
          `${EVENT_SELECT} WHERE e.identificacion = $1 ORDER BY e.fecha_inicio, e.id;`,
          [agentId]
        );
    return result.rows;
  }

  async getById(id: number): Promise<EventRecord | null> {
    const result = await pool.query<EventRecord>(`${EVENT_SELECT} WHERE e.id = $1;`, [id]);
    return result.rows[0] ?? null;
  }

  async agentExists(id: number): Promise<boolean> {
    const result = await pool.query("SELECT 1 FROM agente WHERE identificacion = $1;", [id]);
    return result.rowCount !== 0;
  }

  async cityExists(id: number): Promise<boolean> {
    const result = await pool.query("SELECT 1 FROM ciudad WHERE id = $1;", [id]);
    return result.rowCount !== 0;
  }

  async create(event: EventData): Promise<EventRecord> {
    try {
      const result = await pool.query<EventRecord>(
        `INSERT INTO evento (
           identificacion, id_ciudad, nombre, teatro, capacidad, descripcion,
           precio, fecha_inicio, fecha_fin, observacion, estado
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, identificacion, id_ciudad, nombre, descripcion, teatro,
                   fecha_inicio::text, fecha_fin::text, capacidad,
                   precio, observacion, estado;`,
        [
          event.identificacion, event.id_ciudad, event.nombre, event.teatro,
          event.capacidad, event.descripcion, event.precio, event.fecha_inicio,
          event.fecha_fin, event.observacion, event.estado,
        ]
      );
      const created = result.rows[0];
      if (!created) {
        throw CustomError.internalServer("No se pudo recuperar el evento creado.");
      }
      const city = await pool.query<{ nombre: string }>(
        "SELECT nombre FROM ciudad WHERE id = $1;",
        [created.id_ciudad]
      );
      return { ...created, ciudad: city.rows[0]?.nombre ?? "" };
    } catch (error) {
      translateEventDatabaseError(error);
    }
  }

  async update(id: number, agentId: number, event: EventData): Promise<EventRecord | null> {
    try {
      const result = await pool.query<EventRecord>(
        `UPDATE evento
         SET id_ciudad = $1, nombre = $2, teatro = $3, capacidad = $4,
             descripcion = $5, precio = $6, fecha_inicio = $7, fecha_fin = $8,
             observacion = $9, estado = $10
         WHERE id = $11 AND identificacion = $12
         RETURNING id, identificacion, id_ciudad, nombre, descripcion, teatro,
                   fecha_inicio::text, fecha_fin::text, capacidad, precio,
                   observacion, estado;`,
        [
          event.id_ciudad, event.nombre, event.teatro, event.capacidad,
          event.descripcion, event.precio, event.fecha_inicio, event.fecha_fin,
          event.observacion, event.estado, id, agentId,
        ]
      );
      const updated = result.rows[0];
      if (!updated) {
        return null;
      }
      const city = await pool.query<{ nombre: string }>(
        "SELECT nombre FROM ciudad WHERE id = $1;",
        [updated.id_ciudad]
      );
      return { ...updated, ciudad: city.rows[0]?.nombre ?? "" };
    } catch (error) {
      translateEventDatabaseError(error);
    }
  }

  async deleteIfUnused(id: number, agentId: number): Promise<EventDeleteResult> {
    const client: PoolClient = await pool.connect();
    try {
      await client.query("BEGIN;");
      const event = await client.query<{ identificacion: number }>(
        "SELECT identificacion FROM evento WHERE id = $1 FOR UPDATE;",
        [id]
      );
      const owner = event.rows[0];
      if (!owner) {
        await client.query("COMMIT;");
        return "not-found";
      }
      if (owner.identificacion !== agentId) {
        await client.query("COMMIT;");
        return "forbidden";
      }

      const reservations = await client.query(
        "SELECT 1 FROM reserva WHERE id_evento = $1 LIMIT 1;",
        [id]
      );
      if (reservations.rowCount !== 0) {
        await client.query("COMMIT;");
        return "has-reservations";
      }

      await client.query("DELETE FROM evento WHERE id = $1;", [id]);
      await client.query("COMMIT;");
      return "deleted";
    } catch (error) {
      await client.query("ROLLBACK;");
      translateEventDatabaseError(error);
    } finally {
      client.release();
    }
  }
}
