import { PoolClient } from "pg";
import { pool } from "../../../config/database";
import { CustomError } from "../../../domain/errors/custom.error";
import {
  ReservationActor,
  ReservationResponse,
  ReservationRole,
  ReservationState,
  ReservationsModel,
} from "./reservations.model";
import {
  assertCapacity,
  positiveInteger,
  reservationState,
  stateCode,
} from "./reservations.rules";

interface ReservationInput {
  id_evento?: unknown;
  entradas?: unknown;
  estado?: unknown;
  observacion?: unknown;
  observaciones?: unknown;
}

interface ExistingReservation {
  id: number;
  identificacion: number;
  id_evento: number;
  entradas: number;
  estado: string;
  observacion: string | null;
  agente_id: number;
}

interface EventData {
  id: number;
  capacidad: number;
  precio: number;
  estado: string;
}

interface DatabaseError extends Error {
  code?: string;
}

const RESERVATION_LIMIT = 10;
const BOOKABLE_EVENT_STATES = new Set(["PROGRAMADO", "BOLETERIA"]);

function actorId(actor: ReservationActor): number {
  return positiveInteger(actor.identificacion, "La identificación del usuario");
}

function validateActor(actor: ReservationActor): void {
  if (!actor || !["CLIENTE", "AGENTE", "ADMIN"].includes(actor.rol)) {
    throw CustomError.forbidden("El rol no puede gestionar reservas.");
  }
  actorId(actor);
}

function validateTicketCount(value: unknown): number {
  const count = positiveInteger(value, "La cantidad de entradas");
  if (count > RESERVATION_LIMIT) {
    throw CustomError.badRequest("Una reserva no puede superar 10 entradas.");
  }
  return count;
}

function observationFrom(input: ReservationInput, previous?: string | null): string | null {
  const value = input.observacion ?? input.observaciones;
  if (value === undefined) {
    return previous ?? null;
  }
  if (typeof value !== "string" || value.length > 2000) {
    throw CustomError.badRequest("Las observaciones deben ser texto de hasta 2000 caracteres.");
  }
  return value.trim() || null;
}

function toDatabaseError(error: unknown): unknown {
  const databaseError = error as DatabaseError;
  switch (databaseError.code) {
    case "23503":
      return CustomError.badRequest("El cliente o el evento indicado no existe.");
    case "23514":
    case "23502":
    case "22P02":
    case "22003":
      return CustomError.badRequest("Los datos de la reserva no cumplen las restricciones.");
    case "23505":
      return CustomError.conflict("La reserva entra en conflicto con un registro existente.");
    default:
      return error;
  }
}

export class ReservationsService {
  private readonly reservationsModel = new ReservationsModel();

  public async getAll(actor: ReservationActor): Promise<ReservationResponse[]> {
    validateActor(actor);
    const client = await pool.connect();
    try {
      return await this.reservationsModel.getAll(client, actor);
    } catch (error) {
      throw toDatabaseError(error);
    } finally {
      client.release();
    }
  }

  public async getById(id: unknown, actor: ReservationActor): Promise<ReservationResponse> {
    validateActor(actor);
    const reservationId = positiveInteger(id, "El id de la reserva");
    const client = await pool.connect();
    try {
      return await this.reservationsModel.getById(client, reservationId, actor);
    } catch (error) {
      throw toDatabaseError(error);
    } finally {
      client.release();
    }
  }

  public async create(body: unknown, actor: ReservationActor): Promise<ReservationResponse> {
    validateActor(actor);
    if (actor.rol !== "CLIENTE") {
      throw CustomError.forbidden("Solo un cliente puede crear reservas.");
    }
    if (!body || typeof body !== "object") {
      throw CustomError.badRequest("El cuerpo de la solicitud no es válido.");
    }

    const input = body as ReservationInput;
    const customerId = actorId(actor);
    const eventId = positiveInteger(input.id_evento, "El id del evento");
    const tickets = validateTicketCount(input.entradas);
    const client = await pool.connect();
    let transactionStarted = false;
    try {
      await client.query("BEGIN;");
      transactionStarted = true;

      const customer = await client.query(
        "SELECT 1 FROM cliente WHERE identificacion = $1;",
        [customerId]
      );
      if (customer.rowCount === 0) {
        throw CustomError.forbidden("El usuario autenticado no tiene un perfil de cliente.");
      }

      const event = await this.lockEvents(client, [eventId]);
      const eventData = event.get(eventId);
      if (!eventData) {
        throw CustomError.notFound("No se encontró el evento solicitado.");
      }
      this.assertEventIsBookable(eventData);
      const reserved = await this.getReservedTickets(client, eventId);
      assertCapacity(eventData.capacidad, reserved, tickets);

      const inserted = await client.query<{ id: number }>(
        `INSERT INTO reserva (
           identificacion, id_evento, estado, fecha, total, entradas, observacion
         )
         VALUES ($1, $2, 'RESERVADA', CURRENT_DATE, $3, $4, $5)
         RETURNING id;`,
        [customerId, eventId, eventData.precio * tickets, tickets, observationFrom(input)]
      );
      const id = inserted.rows[0]?.id;
      if (id === undefined) {
        throw CustomError.internalServer("No se pudo recuperar la reserva creada.");
      }

      const response = await this.reservationsModel.getById(client, id, actor);
      await client.query("COMMIT;");
      transactionStarted = false;
      return response;
    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK;");
      }
      throw toDatabaseError(error);
    } finally {
      client.release();
    }
  }

  public async update(
    id: unknown,
    body: unknown,
    actor: ReservationActor
  ): Promise<ReservationResponse> {
    validateActor(actor);
    if (!body || typeof body !== "object") {
      throw CustomError.badRequest("El cuerpo de la solicitud no es válido.");
    }
    const reservationId = positiveInteger(id, "El id de la reserva");
    const input = body as ReservationInput;
    const client = await pool.connect();
    let transactionStarted = false;
    try {
      await client.query("BEGIN;");
      transactionStarted = true;
      const existing = await this.lockReservation(client, reservationId, actor);
      this.assertUpdatePermissions(actor, input);

      const nextState = input.estado === undefined
        ? this.displayState(existing.estado)
        : reservationState(input.estado);
      const nextEventId = input.id_evento === undefined
        ? existing.id_evento
        : positiveInteger(input.id_evento, "El id del evento");
      const nextTickets = input.entradas === undefined
        ? existing.entradas
        : validateTicketCount(input.entradas);
      const observation = observationFrom(input, existing.observacion);

      const events = await this.lockEvents(client, [existing.id_evento, nextEventId]);
      const eventData = events.get(nextEventId);
      if (!eventData) {
        throw CustomError.notFound("No se encontró el evento solicitado.");
      }
      if (nextState !== "Cancelada") {
        this.assertEventIsBookable(eventData);
        const reserved = await this.getReservedTickets(client, nextEventId, reservationId);
        assertCapacity(eventData.capacidad, reserved, nextTickets);
      }

      await client.query(
        `UPDATE reserva
         SET id_evento = $1, estado = $2, entradas = $3, total = $4, observacion = $5
         WHERE id = $6;`,
        [
          nextEventId,
          stateCode(nextState),
          nextTickets,
          eventData.precio * nextTickets,
          observation,
          reservationId,
        ]
      );
      const response = await this.reservationsModel.getById(client, reservationId, actor);
      await client.query("COMMIT;");
      transactionStarted = false;
      return response;
    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK;");
      }
      throw toDatabaseError(error);
    } finally {
      client.release();
    }
  }

  public async delete(id: unknown, actor: ReservationActor): Promise<void> {
    validateActor(actor);
    const reservationId = positiveInteger(id, "El id de la reserva");
    const client = await pool.connect();
    let transactionStarted = false;
    try {
      await client.query("BEGIN;");
      transactionStarted = true;
      await this.lockReservation(client, reservationId, actor);
      await client.query("DELETE FROM reserva WHERE id = $1;", [reservationId]);
      await client.query("COMMIT;");
      transactionStarted = false;
    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK;");
      }
      throw toDatabaseError(error);
    } finally {
      client.release();
    }
  }

  private async lockReservation(
    client: PoolClient,
    id: number,
    actor: ReservationActor
  ): Promise<ExistingReservation> {
    const result = await client.query<ExistingReservation>(
      `SELECT r.id, r.identificacion, r.id_evento, r.entradas, r.estado,
              r.observacion, e.identificacion AS agente_id
       FROM reserva r
       INNER JOIN evento e ON e.id = r.id_evento
       WHERE r.id = $1
       FOR UPDATE OF r;`,
      [id]
    );
    const reservation = result.rows[0];
    if (!reservation) {
      throw CustomError.notFound("No se encontró la reserva solicitada.");
    }
    if (
      actor.rol === "CLIENTE" && reservation.identificacion !== actor.identificacion ||
      actor.rol === "AGENTE" && reservation.agente_id !== actor.identificacion
    ) {
      throw CustomError.notFound("No se encontró la reserva solicitada.");
    }
    return reservation;
  }

  private assertUpdatePermissions(actor: ReservationActor, input: ReservationInput): void {
    if (actor.rol === "AGENTE") {
      if (input.estado === undefined || input.id_evento !== undefined || input.entradas !== undefined) {
        throw CustomError.badRequest(
          "El agente debe indicar el estado y no puede cambiar evento ni entradas."
        );
      }
      reservationState(input.estado);
      return;
    }

    if (actor.rol === "CLIENTE" && input.estado !== undefined) {
      if (reservationState(input.estado) !== "Cancelada") {
        throw CustomError.forbidden("El cliente solo puede cancelar su reserva.");
      }
    }
  }

  private async lockEvents(client: PoolClient, ids: number[]): Promise<Map<number, EventData>> {
    const uniqueIds = [...new Set(ids)].sort((left, right) => left - right);
    const result = await client.query<EventData>(
      `SELECT id, capacidad, precio, estado
       FROM evento
       WHERE id = ANY($1::integer[])
       ORDER BY id
       FOR UPDATE;`,
      [uniqueIds]
    );
    return new Map(result.rows.map((event) => [event.id, event]));
  }

  private async getReservedTickets(
    client: PoolClient,
    eventId: number,
    excludingReservationId?: number
  ): Promise<number> {
    const result = await client.query<{ entradas: number }>(
      `SELECT COALESCE(SUM(entradas), 0)::integer AS entradas
       FROM reserva
       WHERE id_evento = $1
         AND estado <> 'CANCELADA'
         AND ($2::integer IS NULL OR id <> $2);`,
      [eventId, excludingReservationId ?? null]
    );
    const row = result.rows[0];
    if (!row) {
      throw CustomError.internalServer("No se pudo consultar la disponibilidad del evento.");
    }
    return row.entradas;
  }

  private assertEventIsBookable(event: EventData): void {
    if (!BOOKABLE_EVENT_STATES.has(event.estado)) {
      throw CustomError.conflict("El evento no está disponible para reservar.");
    }
  }

  private displayState(value: string): ReservationState {
    return reservationState(value);
  }
}
