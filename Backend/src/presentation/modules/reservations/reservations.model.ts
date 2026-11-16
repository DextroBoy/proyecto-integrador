import { PoolClient } from "pg";
import { CustomError } from "../../../domain/errors/custom.error";

export type ReservationRole = "CLIENTE" | "AGENTE" | "ADMIN";
export type ReservationState = "Reservada" | "Confirmada" | "Cancelada";

export interface ReservationActor {
  identificacion: number;
  rol: ReservationRole;
}

interface EventResponse {
  codigo: number;
  nombre: string;
  descripcion: string;
  teatro: string;
  ciudad: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad: number;
  precio: number;
  observaciones: string;
  estado: "Programado" | "En Boleteria" | "En Vivo" | "Finalizado" | "Cancelado";
}

export interface ReservationResponse {
  codigo: number;
  fecha: string;
  total: number;
  entradas: number;
  observaciones: string;
  estado: ReservationState;
  cliente: {
    identificacion: number;
    nombre: string;
    email: string;
  };
  evento: EventResponse;
}

interface ReservationRecord {
  id: number;
  fecha: string;
  total: number;
  entradas: number;
  observacion: string | null;
  estado: string;
  cliente_id: number;
  cliente_nombre: string;
  cliente_email: string;
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

const RESERVATION_STATES: Record<string, ReservationState> = {
  RESERVADA: "Reservada",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};

const EVENT_STATES: Record<string, EventResponse["estado"]> = {
  PROGRAMADO: "Programado",
  BOLETERIA: "En Boleteria",
  VIVO: "En Vivo",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const RESERVATION_SELECT = `
  SELECT r.id, r.fecha::text, r.total, r.entradas, r.observacion, r.estado,
         p.identificacion AS cliente_id, p.nombre AS cliente_nombre, p.email AS cliente_email,
         e.id AS evento_id, e.nombre AS evento_nombre,
         e.descripcion AS evento_descripcion, e.teatro AS evento_teatro,
         c.nombre AS evento_ciudad, e.fecha_inicio::text AS evento_fecha_inicio,
         e.fecha_fin::text AS evento_fecha_fin, e.capacidad AS evento_capacidad,
         e.precio AS evento_precio, e.observacion AS evento_observacion,
         e.estado AS evento_estado
  FROM reserva r
  INNER JOIN persona p ON p.identificacion = r.identificacion
  INNER JOIN evento e ON e.id = r.id_evento
  INNER JOIN ciudad c ON c.id = e.id_ciudad`;

function toResponse(row: ReservationRecord): ReservationResponse {
  const state = RESERVATION_STATES[row.estado];
  const eventState = EVENT_STATES[row.evento_estado];
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
    cliente: {
      identificacion: row.cliente_id,
      nombre: row.cliente_nombre,
      email: row.cliente_email,
    },
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

export class ReservationsModel {
  public async getAll(
    client: PoolClient,
    actor: ReservationActor
  ): Promise<ReservationResponse[]> {
    const filter = actor.rol === "CLIENTE"
      ? " WHERE r.identificacion = $1"
      : actor.rol === "AGENTE"
        ? " WHERE e.identificacion = $1"
        : "";
    const values = filter ? [actor.identificacion] : [];
    const result = await client.query<ReservationRecord>(
      `${RESERVATION_SELECT}${filter} ORDER BY r.fecha DESC, r.id DESC;`,
      values
    );
    return result.rows.map(toResponse);
  }

  public async getById(
    client: PoolClient,
    id: number,
    actor: ReservationActor
  ): Promise<ReservationResponse> {
    const filter = actor.rol === "CLIENTE"
      ? " AND r.identificacion = $2"
      : actor.rol === "AGENTE"
        ? " AND e.identificacion = $2"
        : "";
    const values = filter ? [id, actor.identificacion] : [id];
    const result = await client.query<ReservationRecord>(
      `${RESERVATION_SELECT} WHERE r.id = $1${filter};`,
      values
    );
    const reservation = result.rows[0];
    if (!reservation) {
      throw CustomError.notFound("No se encontró la reserva solicitada.");
    }
    return toResponse(reservation);
  }
}
