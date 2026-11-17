import { PoolClient } from "pg";
import { pool } from "../../../config/database";
import { CustomError } from "../../../domain/errors/custom.error";

export interface EventRecord {
  id: number;
  identificacion: string;
  id_ciudad: number;
  nombre: string;
  descripcion: string | null;
  teatro: string | null;
  ciudad: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  capacidad: number | null;
  precio: string | number | null;
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
  SELECT e.id, e.num_identificacion AS identificacion, e.id_ciudad, e.nombre,
         e.descripcion, e.teatro, c.nombre AS ciudad,
         e.fecha_hora_inicio::text AS fecha_inicio,
         e.fecha_hora_fin_estimada::text AS fecha_fin, e.capacidad, e.precio,
         e.observacion, se.nombre AS estado
  FROM evento e
  INNER JOIN ciudad c ON c.id = e.id_ciudad
  INNER JOIN estado_evento se ON se.id = e.id_estado`;

function translateEventDatabaseError(error: unknown): never {
  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;
    if (code === "23505") {
      throw CustomError.conflict("Ya existe un evento con esos datos.");
    }
    if (code === "23503") {
      throw CustomError.badRequest("El agente, la ciudad o el estado indicado ya no existe.");
    }
    if (
      code === "23514" ||
      code === "23502" ||
      code === "22001" ||
      code === "22003" ||
      code === "22P02"
    ) {
      throw CustomError.badRequest("Los datos del evento no cumplen las restricciones.");
    }
  }
  throw error;
}

export class EventsModel {
  async getAll(agentId?: number): Promise<EventRecord[]> {
    const result = agentId === undefined
      ? await pool.query<EventRecord>(
          `${EVENT_SELECT} ORDER BY e.fecha_hora_inicio NULLS LAST, e.id;`
        )
      : await pool.query<EventRecord>(
          `${EVENT_SELECT}
           WHERE e.num_identificacion = $1
           ORDER BY e.fecha_hora_inicio NULLS LAST, e.id;`,
          [String(agentId)]
        );
    return result.rows;
  }

  async getById(id: number): Promise<EventRecord | null> {
    const result = await pool.query<EventRecord>(`${EVENT_SELECT} WHERE e.id = $1;`, [id]);
    return result.rows[0] ?? null;
  }

  async agentExists(id: number): Promise<boolean> {
    const result = await pool.query(
      "SELECT 1 FROM agente WHERE num_identificacion = $1;",
      [String(id)]
    );
    return result.rowCount !== 0;
  }

  async cityExists(id: number): Promise<boolean> {
    const result = await pool.query("SELECT 1 FROM ciudad WHERE id = $1;", [id]);
    return result.rowCount !== 0;
  }

  async create(event: EventData): Promise<EventRecord> {
    try {
      const stateId = await this.eventStateId(event.estado);
      const result = await pool.query<{ id: number }>(
        `INSERT INTO evento (
           num_identificacion, id_ciudad, id_estado, nombre, teatro, capacidad,
           descripcion, precio, fecha_hora_inicio, fecha_hora_fin_estimada, observacion
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id;`,
        [
          String(event.identificacion), event.id_ciudad, stateId, event.nombre, event.teatro,
          event.capacidad, event.descripcion, event.precio, event.fecha_inicio,
          event.fecha_fin, event.observacion,
        ]
      );
      const id = result.rows[0]?.id;
      if (id === undefined) {
        throw CustomError.internalServer("No se pudo recuperar el evento creado.");
      }
      const created = await this.getById(id);
      if (!created) {
        throw CustomError.internalServer("No se pudo recuperar el evento creado.");
      }
      return created;
    } catch (error) {
      translateEventDatabaseError(error);
    }
  }

  async update(id: number, agentId: number, event: EventData): Promise<EventRecord | null> {
    try {
      const stateId = await this.eventStateId(event.estado);
      const result = await pool.query<{ id: number }>(
        `UPDATE evento
         SET id_ciudad = $1, id_estado = $2, nombre = $3, teatro = $4, capacidad = $5,
             descripcion = $6, precio = $7, fecha_hora_inicio = $8,
             fecha_hora_fin_estimada = $9, observacion = $10
         WHERE id = $11 AND num_identificacion = $12
         RETURNING id;`,
        [
          event.id_ciudad, stateId, event.nombre, event.teatro, event.capacidad,
          event.descripcion, event.precio, event.fecha_inicio, event.fecha_fin,
          event.observacion, id, String(agentId),
        ]
      );
      const updatedId = result.rows[0]?.id;
      return updatedId === undefined ? null : await this.getById(updatedId);
    } catch (error) {
      translateEventDatabaseError(error);
    }
  }

  async deleteIfUnused(id: number, agentId: number): Promise<EventDeleteResult> {
    const client: PoolClient = await pool.connect();
    try {
      await client.query("BEGIN;");
      const event = await client.query<{ num_identificacion: string }>(
        "SELECT num_identificacion FROM evento WHERE id = $1 FOR UPDATE;",
        [id]
      );
      const owner = event.rows[0];
      if (!owner) {
        await client.query("COMMIT;");
        return "not-found";
      }
      if (owner.num_identificacion !== String(agentId)) {
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

  private async eventStateId(code: string): Promise<number> {
    const result = await pool.query<{ id: number }>(
      "SELECT id FROM estado_evento WHERE nombre = $1;",
      [code]
    );
    const id = result.rows[0]?.id;
    if (id === undefined) {
      throw CustomError.internalServer(`No está configurado el estado de evento ${code}.`);
    }
    return id;
  }
}
