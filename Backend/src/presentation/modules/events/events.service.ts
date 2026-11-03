import { pool } from "../../../config/database";
import { CustomError } from "../../../domain/errors/custom.error";

type EventState =
  | "Programado"
  | "En Boleteria"
  | "En Vivo"
  | "Finalizado"
  | "Cancelado";

interface EventRecord {
  id: number;
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
  estado: EventState;
}

interface NewEvent {
  identificacion: unknown;
  id_ciudad: unknown;
  nombre: unknown;
  teatro: unknown;
  capacidad: unknown;
  descripcion: unknown;
  precio: unknown;
  fecha_inicio: unknown;
  fecha_fin: unknown;
  observacion: unknown;
  estado: unknown;
}

const EVENT_STATES: Record<string, EventState> = {
  PROGRAMADO: "Programado",
  BOLETERIA: "En Boleteria",
  VIVO: "En Vivo",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const EVENT_STATE_CODES: Record<EventState, string> = {
  Programado: "PROGRAMADO",
  "En Boleteria": "BOLETERIA",
  "En Vivo": "VIVO",
  Finalizado: "FINALIZADO",
  Cancelado: "CANCELADO",
};

const EVENT_SELECT = `
  SELECT e.id, e.nombre, e.descripcion, e.teatro, c.nombre AS ciudad,
         e.fecha_inicio::text, e.fecha_fin::text, e.capacidad, e.precio,
         e.observacion, e.estado
  FROM evento e
  INNER JOIN ciudad c ON c.id = e.id_ciudad`;

function toResponse(event: EventRecord): EventResponse {
  const estado = EVENT_STATES[event.estado];
  if (!estado) {
    throw CustomError.internalServer(`Estado de evento no reconocido: ${event.estado}`);
  }

  return {
    codigo: event.id,
    nombre: event.nombre,
    descripcion: event.descripcion,
    teatro: event.teatro,
    ciudad: event.ciudad,
    fecha_inicio: event.fecha_inicio,
    fecha_fin: event.fecha_fin,
    capacidad: event.capacidad,
    precio: event.precio,
    observaciones: event.observacion ?? "",
    estado,
  };
}

function positiveInteger(value: unknown, field: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw CustomError.badRequest(`${field} debe ser un entero positivo.`);
  }
  return parsed;
}

function validDate(value: unknown, field: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw CustomError.badRequest(`${field} debe ser una fecha válida.`);
  }
  return value.slice(0, 10);
}

function eventStateCode(value: unknown): string {
  if (typeof value !== "string") {
    throw CustomError.badRequest("El estado del evento no es válido.");
  }

  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const code = normalized === "EN_BOLETERIA" ? "BOLETERIA"
    : normalized === "EN_VIVO" ? "VIVO"
    : normalized;

  if (!Object.hasOwn(EVENT_STATES, code)) {
    throw CustomError.badRequest("El estado del evento no es válido.");
  }
  return code;
}

export class EventsService {
  public async getAll(): Promise<EventResponse[]> {
    const result = await pool.query<EventRecord>(
      `${EVENT_SELECT} ORDER BY e.fecha_inicio, e.id;`
    );
    return result.rows.map(toResponse);
  }

  public async getById(id: unknown): Promise<EventResponse> {
    const eventId = positiveInteger(id, "El id del evento");
    const result = await pool.query<EventRecord>(
      `${EVENT_SELECT} WHERE e.id = $1;`,
      [eventId]
    );
    const event = result.rows[0];
    if (!event) {
      throw CustomError.notFound("No se encontró el evento solicitado.");
    }
    return toResponse(event);
  }

  public async create(body: unknown): Promise<EventResponse> {
    if (!body || typeof body !== "object") {
      throw CustomError.badRequest("El cuerpo de la solicitud no es válido.");
    }

    const event = body as NewEvent;
    const agentId = positiveInteger(event.identificacion, "La identificación del agente");
    const cityId = positiveInteger(event.id_ciudad, "El id de la ciudad");
    const capacity = positiveInteger(event.capacidad, "La capacidad");
    const price = typeof event.precio === "number" ? event.precio : Number(event.precio);

    if (!Number.isSafeInteger(price) || price < 0) {
      throw CustomError.badRequest("El precio debe ser un entero no negativo.");
    }
    if (
      typeof event.nombre !== "string" || !event.nombre.trim() ||
      typeof event.teatro !== "string" || !event.teatro.trim() ||
      typeof event.descripcion !== "string" || !event.descripcion.trim()
    ) {
      throw CustomError.badRequest("Nombre, teatro y descripción son obligatorios.");
    }

    const startDate = validDate(event.fecha_inicio, "La fecha de inicio");
    const endDate = validDate(event.fecha_fin, "La fecha de finalización");
    if (endDate < startDate) {
      throw CustomError.badRequest("La fecha de finalización no puede ser anterior al inicio.");
    }

    const state = eventStateCode(event.estado ?? "PROGRAMADO");
    const agent = await pool.query(
      "SELECT 1 FROM agente WHERE identificacion = $1;",
      [agentId]
    );
    if (agent.rowCount === 0) {
      throw CustomError.badRequest("La identificación no corresponde a un agente.");
    }

    const city = await pool.query("SELECT 1 FROM ciudad WHERE id = $1;", [cityId]);
    if (city.rowCount === 0) {
      throw CustomError.badRequest("No se encontró la ciudad indicada.");
    }

    const result = await pool.query<{ id: number }>(
      `INSERT INTO evento (
         identificacion, id_ciudad, nombre, teatro, capacidad, descripcion,
         precio, fecha_inicio, fecha_fin, observacion, estado
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id;`,
      [
        agentId,
        cityId,
        event.nombre.trim(),
        event.teatro.trim(),
        capacity,
        event.descripcion.trim(),
        price,
        startDate,
        endDate,
        typeof event.observacion === "string" ? event.observacion.trim() : null,
        state,
      ]
    );

    const createdEvent = result.rows[0];
    if (!createdEvent) {
      throw CustomError.internalServer("No se pudo recuperar el evento creado.");
    }
    return this.getById(String(createdEvent.id));
  }
}
