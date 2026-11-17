import { PoolClient } from "pg";
import { CustomError } from "../../../domain/errors/custom.error";

export type ReservationRole = "CLIENTE" | "AGENTE" | "ADMIN";
export type ReservationState = "Reservada" | "Confirmada" | "Cancelada";
export type EventState =
  | "Programado"
  | "En Boleteria"
  | "En Vivo"
  | "Finalizado"
  | "Cancelado";

export interface ReservationActor {
  identificacion: number;
  rol: ReservationRole;
}

interface EventResponse {
  codigo: number;
  nombre: string;
  descripcion: string | null;
  teatro: string | null;
  ciudad: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  capacidad: number | null;
  precio: number | null;
  observaciones: string | null;
  estado: EventState;
}

export interface ReservationResponse {
  codigo: number;
  fecha: string;
  total: number | null;
  entradas: number | null;
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
  total: string | number | null;
  entradas: number | null;
  observacion: string | null;
  estado: string;
  cliente_id: string | number;
  cliente_nombre: string;
  cliente_email: string;
  evento_id: number;
  evento_nombre: string;
  evento_descripcion: string | null;
  evento_teatro: string | null;
  evento_ciudad: string;
  evento_fecha_inicio: string | null;
  evento_fecha_fin: string | null;
  evento_capacidad: number | null;
  evento_precio: string | number | null;
  evento_observacion: string | null;
  evento_estado: string;
}

const RESERVATION_STATES: Record<string, ReservationState> = {
  RESERVADA: "Reservada",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};

const EVENT_STATES: Record<string, EventState> = {
  PROGRAMADO: "Programado",
  BOLETERIA: "En Boleteria",
  VIVO: "En Vivo",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const RESERVATION_SELECT = `
  SELECT r.id, r.fecha_hora_reserva::text AS fecha, r.total, r.entradas,
         r.observacion, sr.nombre AS estado,
         p.num_identificacion AS cliente_id, p.nombre_completo AS cliente_nombre,
         p.correo_electronico AS cliente_email,
         e.id AS evento_id, e.nombre AS evento_nombre,
         e.descripcion AS evento_descripcion, e.teatro AS evento_teatro,
         c.nombre AS evento_ciudad, e.fecha_hora_inicio::text AS evento_fecha_inicio,
         e.fecha_hora_fin_estimada::text AS evento_fecha_fin, e.capacidad AS evento_capacidad,
         e.precio AS evento_precio, e.observacion AS evento_observacion,
         se.nombre AS evento_estado
  FROM reserva r
  INNER JOIN persona p ON p.num_identificacion = r.num_identificacion
  INNER JOIN evento e ON e.id = r.id_evento
  INNER JOIN ciudad c ON c.id = e.id_ciudad
  INNER JOIN estado_reserva sr ON sr.id = r.id_estado
  INNER JOIN estado_evento se ON se.id = e.id_estado`;

function toResponse(row: ReservationRecord): ReservationResponse {
  const state = RESERVATION_STATES[row.estado.toUpperCase()];
  const eventState = EVENT_STATES[row.evento_estado.toUpperCase()];
  if (!state || !eventState) {
    throw CustomError.internalServer("La reserva o el evento tienen un estado no reconocido.");
  }

  return {
    codigo: row.id,
    fecha: row.fecha,
    total: row.total === null ? null : Number(row.total),
    entradas: row.entradas,
    observaciones: row.observacion ?? "",
    estado: state,
    cliente: {
      identificacion: Number(row.cliente_id),
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
      precio: row.evento_precio === null ? null : Number(row.evento_precio),
      observaciones: row.evento_observacion,
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
      ? " WHERE r.num_identificacion = $1"
      : actor.rol === "AGENTE"
        ? " WHERE e.num_identificacion = $1"
        : "";
    const values = filter ? [String(actor.identificacion)] : [];
    const result = await client.query<ReservationRecord>(
      `${RESERVATION_SELECT}${filter} ORDER BY r.fecha_hora_reserva DESC, r.id DESC;`,
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
      ? " AND r.num_identificacion = $2"
      : actor.rol === "AGENTE"
        ? " AND e.num_identificacion = $2"
        : "";
    const values = filter ? [id, String(actor.identificacion)] : [id];
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
