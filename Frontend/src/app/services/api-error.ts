import { HttpErrorResponse } from '@angular/common/http';

<<<<<<< HEAD
export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const message = error.error?.error;
    if (typeof message === 'string') {
      return message;
    }
    if (error.status === 0) {
      return 'No fue posible conectar con el servidor. Inténtalo más tarde.';
    }
  }
  return 'Ocurrió un error al procesar la solicitud.';
=======
export function getApiErrorMessage(error: unknown): string | undefined {
  if (!(error instanceof HttpErrorResponse)) {
    return undefined;
  }

  const body: unknown = error.error;
  if (
    body &&
    typeof body === 'object' &&
    'error' in body &&
    typeof body.error === 'string'
  ) {
    return body.error;
  }
  return error.message || undefined;
>>>>>>> 9c98844b03854f048f63b410d1e8a389e9ca45e9
}
