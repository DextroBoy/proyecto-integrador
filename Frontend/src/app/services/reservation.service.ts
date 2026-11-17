import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Reservation, ReservationState } from '../interfaces/reservation.interface';
import { API_BASE_URL } from './api-base-url';

type ReservationPayload = Omit<Reservation, 'fecha' | 'evento'> & {
  fecha: string;
  evento: Omit<Reservation['evento'], 'fecha_inicio' | 'fecha_fin'> & {
    fecha_inicio: string | null;
    fecha_fin: string | null;
  };
};

function mapReservation(reservation: ReservationPayload): Reservation {
  return {
    ...reservation,
    fecha: new Date(`${reservation.fecha.slice(0, 10)}T12:00:00`),
    evento: {
      ...reservation.evento,
      fecha_inicio: reservation.evento.fecha_inicio
        ? new Date(`${reservation.evento.fecha_inicio.slice(0, 10)}T12:00:00`)
        : null,
      fecha_fin: reservation.evento.fecha_fin
        ? new Date(`${reservation.evento.fecha_fin.slice(0, 10)}T12:00:00`)
        : null,
    },
  };
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/reservations`;

  getAll(): Observable<Reservation[]> {
    return this.http
      .get<ReservationPayload[]>(this.url)
      .pipe(map((reservations) => reservations.map(mapReservation)));
  }

  getById(id: number): Observable<Reservation> {
    return this.http.get<ReservationPayload>(`${this.url}/${id}`).pipe(map(mapReservation));
  }

  create(idEvento: number, entradas: number, observacion = ''): Observable<Reservation> {
    return this.http
      .post<ReservationPayload>(this.url, {
        id_evento: idEvento,
        entradas,
        observacion,
      })
      .pipe(map(mapReservation));
  }

  update(
    id: number,
    updates: {
      id_evento?: number;
      entradas?: number;
      estado?: ReservationState;
      observacion?: string;
    },
  ): Observable<Reservation> {
    return this.http
      .put<ReservationPayload>(`${this.url}/${id}`, updates)
      .pipe(map(mapReservation));
  }

  updateState(id: number, estado: ReservationState): Observable<Reservation> {
    return this.update(id, { estado });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
