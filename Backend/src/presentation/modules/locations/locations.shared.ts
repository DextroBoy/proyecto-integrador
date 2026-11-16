import { CustomError } from "../../../domain/errors/custom.error";

export type LocationDeleteResult = "deleted" | "not-found" | "in-use";

export function positiveId(value: unknown, field: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw CustomError.badRequest(`${field} debe ser un entero positivo.`);
  }
  return parsed;
}

export function locationName(value: unknown, field = "El nombre"): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 100) {
    throw CustomError.badRequest(`${field} es obligatorio y no debe superar 100 caracteres.`);
  }
  return value.trim();
}

export function bodyRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw CustomError.badRequest("El cuerpo de la solicitud no es válido.");
  }
  return value as Record<string, unknown>;
}

export function translateLocationDatabaseError(error: unknown): never {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "23505" || error.code === "23503")
  ) {
    throw CustomError.conflict(
      error.code === "23505"
        ? "Ya existe un registro con esos datos."
        : "La ubicación está relacionada con otros registros."
    );
  }
  throw error;
}
