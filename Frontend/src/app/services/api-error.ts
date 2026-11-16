import { HttpErrorResponse } from '@angular/common/http';

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
}
