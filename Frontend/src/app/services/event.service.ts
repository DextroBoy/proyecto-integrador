import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Event } from '../interfaces/event.interface';
import { API_BASE_URL } from './api.config';

type EventPayload = Omit<Event, 'fecha_inicio' | 'fecha_fin'> & {
  fecha_inicio: string;
  fecha_fin: string;
};

function mapEvent(event: EventPayload): Event {
  return {
    ...event,
    fecha_inicio: new Date(event.fecha_inicio),
    fecha_fin: new Date(event.fecha_fin),
  };
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly url = `${API_BASE_URL}/events`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Event[]> {
    return this.http.get<EventPayload[]>(this.url).pipe(map((events) => events.map(mapEvent)));
  }

  getByCode(code: number): Observable<Event> {
    return this.http.get<EventPayload>(`${this.url}/${code}`).pipe(map(mapEvent));
  }
}
