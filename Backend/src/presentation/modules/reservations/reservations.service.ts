import { PoolClient } from "pg";
import { pool } from "../../../config/database";
import { CustomError } from "../../../domain/errors/custom.error";
import { EventsService } from "../events/events.service";

type ReservationState = "Reservada" | "Confirmada" | "Cancelada";

interface ReservationRecord {
  id: number;
  fecha: string;
  total: number;
  entradas: number;
  observacion: string | null;
  estado: string;
  evento_id: number;
  evento_nombre: string;
  evento_descripcion: string;
  evento_teatro: string;
  evento_ciudad: string;
  evento_fecha_inicio: string;
  evento_fecha_fin: string;
  evento_capacidad: number;
  evento_precio: number;
  evento_observacion: string | null;
  evento_estado: string;
}

interface ReservationResponse {
  codigo: number;
  fecha: string;
  total: number;
  entradas: number;
  observaciones: string;
  estado: ReservationState;
  evento: Awaited<ReturnType<EventsService["getById"]>>;
}

interface NewReservation {
  identificacion: unknown;
  id_evento: unknown;
  entradas: unknown;
  observacion: unknown;
}

const RESERVATION_STATES: Record<string, ReservationState> = {
  RESERVADA: "Reservada",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};

const RESERVATION_STATE_CODES: Record<ReservationState, string> = {
  Reservada: "RESERVADA",
  Confirmada: "CONFIRMADA",
  Cancelada: "CANCELADA",
};

const RESERVATION_SELECT = `
  SELECT r.id, r.fecha::text, r.total, r.entradas, r.observacion, r.estado,
         e.id AS evento_id, e.nombre AS evento_nombre,
         e.descripcion AS evento_descripcion, e.teatro AS evento_teatro,
         c.nombre AS evento_ciudad, e.fecha_inicio::text AS evento_fecha_inicio,
         e.fecha_fin::text AS evento_fecha_fin, e.capacidad AS evento_capacidad,
         e.precio AS evento_precio, e.observacion AS evento_observacion,
         e.estado AS evento_estado
  FROM reserva r
  INNER JOIN evento e ON e.id = r.id_evento
  INNER JOIN ciudad c ON c.id = e.id_ciudad`;

function positiveInteger(value: unknown, field: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw CustomError.badRequest(`${field} debe ser un entero positivo.`);
  }
  return parsed;
}

function toResponse(row: ReservationRecord): ReservationResponse {
  const state = RESERVATION_STATES[row.estado];
  const eventState: ReservationResponse["evento"]["estado"] = {
    PROGRAMADO: "Programado",
    BOLETERIA: "En Boleteria",
    VIVO: "En Vivo",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
  }[row.evento_estado] as ReservationResponse["evento"]["estado"];

  if (!state || !eventState) {
    throw CustomError.internalServer("La reserva o el evento tienen un estado no reconocido.");
  }

  return {
    codigo: row.id,
    fecha: row.fecha,
    total: row.total,
    entradas: row.entradas,
    observaciones: row.observacion ?? "",
    estado: state,
    evento: {
      codigo: row.evento_id,
      nombre: row.evento_nombre,
      descripcion: row.evento_descripcion,
      teatro: row.evento_teatro,
      ciudad: row.evento_ciudad,
      fecha_inicio: row.evento_fecha_inicio,
      fecha_fin: row.evento_fecha_fin,
      capacidad: row.evento_capacidad,
      precio: row.evento_precio,
      observaciones: row.evento_observacion ?? "",
      estado: eventState,
    },
  };
}

async function getById(client: PoolClient, id: number): Promise<ReservationResponse> {
  const result = await client.query<ReservationRecord>(
    `${RESERVATION_SELECT} WHERE r.id = $1;`,
    [id]
  );
  const reservation = result.rows[0];
  if (!reservation) {
    throw CustomError.notFound("No se encontró la reserva solicitada.");
  }
  return toResponse(reservation);
}

export class ReservationsService {
  public async getAll(cliente: unknown): Promise<ReservationResponse[]> {
    if (cliente !== undefined && typeof cliente !== "string") {
      throw CustomError.badRequest("El parámetro cliente debe ser una identificación válida.");
    }

    const values: number[] = [];
    let filter = "";
    if (cliente !== undefined) {
      values.push(positiveInteger(cliente, "El parámetro cliente"));
      filter = " WHERE r.identificacion = $1";
    }

    const result = await pool.query<ReservationRecord>(
      `${RESERVATION_SELECT}${filter} ORDER BY r.fecha DESC, r.id DESC;`,
      values
    );
    return result.rows.map(toResponse);
  }

  public async create(body: unknown): Promise<ReservationResponse> {
    if (!body || typeof body !== "object") {
      throw CustomError.badRequest("El cuerpo de la solicitud no es válido.");
    }

    const reservation = body as NewReservation;
    const clientId = positiveInteger(reservation.identificacion, "La identificación del cliente");
    const eventId = positiveInteger(reservation.id_evento, "El id del evento");
    const ticketCount = positiveInteger(reservation.entradas, "La cantidad de entradas");
    if (ticketCount > 10) {
      throw CustomError.badRequest("Una reserva no puede superar 10 entradas.");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN;");

      const customer = await client.query(
        "SELECT 1 FROM cliente WHERE identificacion = $1;",
        [clientId]
      );
      if (customer.rowCount === 0) {
        throw CustomError.badRequest("La identificación no corresponde a un cliente.");
      }

      const event = await client.query<{ capacidad: number; precio: number }>(
        `SELECT capacidad, precio
         FROM evento
         WHERE id = $1
         FOR UPDATE;`,
        [eventId]
      );
      const eventData = event.rows[0];
      if (!eventData) {
        throw CustomError.notFound("No se encontró el evento solicitado.");
      }

      const reserved = await client.query<{ entradas: number }>(
        `SELECT COALESCE(SUM(entradas), 0)::integer AS entradas
         FROM reserva
         WHERE id_evento = $1 AND estado <> 'CANCELADA';`,
        [eventId]
      );
      const reservationCount = reserved.rows[0];
      if (!reservationCount) {
        throw CustomError.internalServer("No se pudo consultar la disponibilidad del evento.");
      }
      if (reservationCount.entradas + ticketCount > eventData.capacidad) {
        throw CustomError.conflict("No hay suficientes cupos disponibles para el evento.");
      }

      const inserted = await client.query<{ id: number }>(
        `INSERT INTO reserva (
           identificacion, id_evento, estado, fecha, total, entradas, observacion
         )
         VALUES ($1, $2, 'RESERVADA', CURRENT_DATE, $3, $4, $5)
         RETURNING id;`,
        [
          clientId,
          eventId,
          eventData.precio * ticketCount,
          ticketCount,
          typeof reservation.observacion === "string"
            ? reservation.observacion.trim()
            : null,
        ]
      );

      const createdReservation = inserted.rows[0];
      if (!createdReservation) {
        throw CustomError.internalServer("No se pudo recuperar la reserva creada.");
      }
      const response = await getById(client, createdReservation.id);
      await client.query("COMMIT;");
      return response;
    } catch (error) {
      await client.query("ROLLBACK;");
      throw error;
    } finally {
      client.release();
    }
  }

  public async updateState(
    id: unknown,
    state: unknown
  ): Promise<ReservationResponse> {
    const reservationId = positiveInteger(id, "El id de la reserva");
    if (typeof state !== "string") {
      throw CustomError.badRequest("El estado de la reserva no es válido.");
    }

    const normalized = state.trim().toUpperCase();
    const stateCode = Object.hasOwn(RESERVATION_STATES, normalized)
      ? normalized
      : Object.entries(RESERVATION_STATE_CODES).find(
          ([display]) => display.toUpperCase() === normalized
        )?.[1];
    if (!stateCode) {
      throw CustomError.badRequest("El estado debe ser Reservada, Confirmada o Cancelada.");
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "UPDATE reserva SET estado = $1 WHERE id = $2 RETURNING id;",
        [stateCode, reservationId]
      );
      if (result.rowCount === 0) {
        throw CustomError.notFound("No se encontró la reserva solicitada.");
      }
      return await getById(client, reservationId);
    } finally {
      client.release();
    }
  }
}
