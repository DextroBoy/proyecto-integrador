import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { Event, EventPayload } from '../interfaces/event.interface';

interface ApiEvent extends Omit<Event, 'fecha_inicio' | 'fecha_fin'> {
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

function apiDate(value: string | null): Date | null {
  return value ? new Date(`${value.slice(0, 10)}T12:00:00`) : null;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getAll(): Observable<Event[]> {
    return this.http.get<ApiEvent[]>(`${this.apiUrl}/events`).pipe(
      map((events) => events.map((event) => this.fromApi(event))),
    );
  }

  getByCode(code: number): Observable<Event> {
    return this.http.get<ApiEvent>(`${this.apiUrl}/events/${code}`).pipe(
      map((event) => this.fromApi(event)),
    );
  }

  create(payload: EventPayload): Observable<Event> {
    return this.http.post<ApiEvent>(`${this.apiUrl}/events`, payload).pipe(
      map((event) => this.fromApi(event)),
    );
  }

  update(code: number, payload: EventPayload): Observable<Event> {
    return this.http.put<ApiEvent>(`${this.apiUrl}/events/${code}`, payload).pipe(
      map((event) => this.fromApi(event)),
    );
  }

  delete(code: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${code}`);
  }

  private fromApi(event: ApiEvent): Event {
    return {
      ...event,
      fecha_inicio: apiDate(event.fecha_inicio),
      fecha_fin: apiDate(event.fecha_fin),
    };
  }
}
