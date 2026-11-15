import { HttpErrorResponse } from '@angular/common/http';

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
}
