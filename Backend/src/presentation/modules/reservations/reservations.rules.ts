import { CustomError } from "../../../domain/errors/custom.error";
import { ReservationState } from "./reservations.model";

const RESERVATION_STATE_CODES: Record<string, ReservationState> = {
  RESERVADA: "Reservada",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};

export function positiveInteger(value: unknown, field: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw CustomError.badRequest(`${field} debe ser un entero positivo.`);
  }
  return parsed;
}

export function reservationState(value: unknown): ReservationState {
  if (typeof value !== "string") {
    throw CustomError.badRequest("El estado de la reserva no es válido.");
  }
  const normalized = value.trim().toUpperCase();
  const code = normalized.replace(/[\s-]+/g, "_");
  const state = RESERVATION_STATE_CODES[code];
  if (!state) {
    throw CustomError.badRequest("El estado debe ser Reservada, Confirmada o Cancelada.");
  }
  return state;
}

export function assertCapacity(
  capacity: number,
  alreadyReserved: number,
  requested: number
): void {
  if (alreadyReserved + requested > capacity) {
    throw CustomError.conflict("No hay suficientes cupos disponibles para el evento.");
  }
}

export function stateCode(state: ReservationState): string {
  return state.toUpperCase();
}
