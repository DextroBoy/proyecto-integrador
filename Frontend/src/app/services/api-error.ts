import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body: unknown = error.error;
    if (
      body &&
      typeof body === 'object' &&
      'error' in body &&
      typeof body.error === 'string'
    ) {
      return body.error;
    }
    if (error.status === 0) {
      return 'No fue posible conectar con el servidor. Inténtalo más tarde.';
    }
    return error.message || 'Ocurrió un error al procesar la solicitud.';
  }
  return 'Ocurrió un error al procesar la solicitud.';
}

export function getApiErrorMessage(error: unknown): string | undefined {
  const message = apiErrorMessage(error);
  return message === 'Ocurrió un error al procesar la solicitud.' ? undefined : message;
}
