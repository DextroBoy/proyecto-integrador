import { CustomError } from "../../../domain/errors/custom.error";
import { EventData, EventRecord, EventsModel } from "./events.model";

export type EventState =
  | "Programado"
  | "En Boleteria"
  | "En Vivo"
  | "Finalizado"
  | "Cancelado";

export interface EventResponse {
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

export interface ManagedEventResponse extends EventResponse {
  identificacion: number;
  id_ciudad: number;
}

const EVENT_STATES: Record<string, EventState> = {
  PROGRAMADO: "Programado",
  BOLETERIA: "En Boleteria",
  VIVO: "En Vivo",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const MAX_POSTGRES_INTEGER = 2_147_483_647;

function toResponse(event: EventRecord): ManagedEventResponse {
  const estado = EVENT_STATES[event.estado];
  if (!estado) {
    throw CustomError.internalServer(`Estado de evento no reconocido: ${event.estado}`);
  }
  return {
    codigo: event.id,
    identificacion: event.identificacion,
    id_ciudad: event.id_ciudad,
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
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_POSTGRES_INTEGER) {
    throw CustomError.badRequest(`${field} debe ser un entero positivo válido.`);
  }
  return parsed;
}

function validDate(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw CustomError.badRequest(`${field} debe ser una fecha válida.`);
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw CustomError.badRequest(`${field} debe usar el formato YYYY-MM-DD.`);
  }
  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() !== Number(month) - 1 ||
    parsed.getUTCDate() !== Number(day)
  ) {
    throw CustomError.badRequest(`${field} debe ser una fecha válida.`);
  }
  return `${year}-${month}-${day}`;
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

function eventBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw CustomError.badRequest("El cuerpo de la solicitud no es válido.");
  }
  return body as Record<string, unknown>;
}

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw CustomError.badRequest(`${field} es obligatorio.`);
  }
  const text = value.trim();
  if (text.length > maxLength) {
    throw CustomError.badRequest(`${field} no puede superar ${maxLength} caracteres.`);
  }
  return text;
}

export class EventsService {
  constructor(private readonly model = new EventsModel()) {}

  async getAll(role: string, userId: number): Promise<ManagedEventResponse[]> {
    const records = await this.model.getAll(role === "AGENTE" ? userId : undefined);
    return records.map(toResponse);
  }

  async getById(rawId: unknown): Promise<EventResponse> {
    const id = positiveInteger(rawId, "El id del evento");
    const event = await this.model.getById(id);
    if (!event) {
      throw CustomError.notFound("No se encontró el evento solicitado.");
    }
    const { identificacion: _identificacion, id_ciudad: _idCiudad, ...response } = toResponse(event);
    return response;
  }

  async getManagedById(
    rawId: unknown,
    userId: number,
    role: string
  ): Promise<ManagedEventResponse> {
    const id = positiveInteger(rawId, "El id del evento");
    const event = await this.model.getById(id);
    if (!event) {
      throw CustomError.notFound("No se encontró el evento solicitado.");
    }
    this.assertOwner(event, userId, role);
    return toResponse(event);
  }

  async create(rawBody: unknown, agentId: number): Promise<ManagedEventResponse> {
    const data = this.validatedEvent(rawBody, agentId);
    if (!(await this.model.agentExists(agentId))) {
      throw CustomError.badRequest("La identidad autenticada no corresponde a un agente.");
    }
    if (!(await this.model.cityExists(data.id_ciudad))) {
      throw CustomError.badRequest("No se encontró la ciudad indicada.");
    }
    return toResponse(await this.model.create(data));
  }

  async update(rawId: unknown, rawBody: unknown, agentId: number): Promise<ManagedEventResponse> {
    const id = positiveInteger(rawId, "El id del evento");
    const existing = await this.model.getById(id);
    if (!existing) {
      throw CustomError.notFound("No se encontró el evento solicitado.");
    }
    this.assertOwner(existing, agentId, "AGENTE");
    const data = this.validatedEvent(rawBody, agentId);
    if (!(await this.model.cityExists(data.id_ciudad))) {
      throw CustomError.badRequest("No se encontró la ciudad indicada.");
    }
    const updated = await this.model.update(id, agentId, data);
    if (!updated) {
      throw CustomError.notFound("No se encontró el evento solicitado.");
    }
    return toResponse(updated);
  }

  async delete(rawId: unknown, agentId: number): Promise<void> {
    const id = positiveInteger(rawId, "El id del evento");
    const result = await this.model.deleteIfUnused(id, agentId);
    if (result === "not-found") {
      throw CustomError.notFound("No se encontró el evento solicitado.");
    }
    if (result === "forbidden") {
      throw CustomError.forbidden("Solo puedes administrar tus propios eventos.");
    }
    if (result === "has-reservations") {
      throw CustomError.conflict(
        "No se puede eliminar el evento porque tiene reservas asociadas. Cancélalo o conserva su historial."
      );
    }
  }

  private validatedEvent(rawBody: unknown, agentId: number): EventData {
    const body = eventBody(rawBody);
    const capacity = positiveInteger(body.capacidad, "La capacidad");
    const price = typeof body.precio === "number" ? body.precio : Number(body.precio);
    if (!Number.isSafeInteger(price) || price < 0 || price > MAX_POSTGRES_INTEGER) {
      throw CustomError.badRequest("El precio debe ser un entero no negativo válido.");
    }

    const fechaInicio = validDate(body.fecha_inicio, "La fecha de inicio");
    const fechaFin = validDate(body.fecha_fin, "La fecha de finalización");
    if (fechaFin < fechaInicio) {
      throw CustomError.badRequest("La fecha de finalización no puede ser anterior al inicio.");
    }

    const state = body.estado === undefined || body.estado === null
      ? "PROGRAMADO"
      : eventStateCode(body.estado);
    const observacion = body.observaciones ?? body.observacion;
    if (observacion !== undefined && observacion !== null && typeof observacion !== "string") {
      throw CustomError.badRequest("Las observaciones deben ser texto.");
    }

    return {
      identificacion: positiveInteger(agentId, "La identidad autenticada del agente"),
      id_ciudad: positiveInteger(body.id_ciudad, "El id de la ciudad"),
      nombre: requiredText(body.nombre, "El nombre", 100),
      teatro: requiredText(body.teatro, "El teatro", 100),
      capacidad: capacity,
      descripcion: requiredText(body.descripcion, "La descripción", Number.MAX_SAFE_INTEGER),
      precio: price,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      observacion: typeof observacion === "string" ? observacion.trim() || null : null,
      estado: state,
    };
  }

  private assertOwner(event: EventRecord, userId: number, role: string): void {
    if (role === "AGENTE" && event.identificacion !== userId) {
      throw CustomError.forbidden("Solo puedes administrar tus propios eventos.");
    }
  }
}
