import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Event, EventPayload } from '../interfaces/event.interface';
import { API_BASE_URL } from './api-base-url';
import { EventService } from './event.service';
import { ReservationService } from './reservation.service';

const apiEvent = {
  codigo: 42,
  identificacion: 7001,
  id_ciudad: 13,
  nombre: 'Festival',
  descripcion: 'Música en vivo',
  teatro: 'Auditorio',
  ciudad: 'Cali',
  fecha_inicio: '2026-10-15',
  fecha_fin: '2026-10-16',
  capacidad: 500,
  precio: 85000,
  observaciones: '',
  estado: 'Programado' as const,
};

describe('EventService API integration', () => {
  let service: EventService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test/api' },
      ],
    });
    service = TestBed.inject(EventService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('loads events from the API and maps date-only values to local dates', () => {
    let result: Event[] | undefined;
    service.getAll().subscribe((events) => result = events);

    const request = httpTesting.expectOne('http://api.test/api/events');
    expect(request.request.method).toBe('GET');
    request.flush([apiEvent]);

    expect(result?.length).toBe(1);
    expect(result?.[0].codigo).toBe(42);
    expect(result?.[0].fecha_inicio.getFullYear()).toBe(2026);
    expect(result?.[0].fecha_inicio.getMonth()).toBe(9);
    expect(result?.[0].fecha_inicio.getDate()).toBe(15);
  });

  it('uses the API CRUD endpoints and sends a city ID without an agent ID', () => {
    const payload: EventPayload = {
      id_ciudad: 13,
      nombre: 'Festival',
      descripcion: 'Música en vivo',
      teatro: 'Auditorio',
      fecha_inicio: '2026-10-15',
      fecha_fin: '2026-10-16',
      capacidad: 500,
      precio: 85000,
      observaciones: '',
      estado: 'Programado',
    };

    service.create(payload).subscribe();
    const createRequest = httpTesting.expectOne('http://api.test/api/events');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual(payload);
    expect(createRequest.request.body.identificacion).toBeUndefined();
    createRequest.flush(apiEvent);

    service.update(42, payload).subscribe();
    const updateRequest = httpTesting.expectOne('http://api.test/api/events/42');
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush(apiEvent);

    service.delete(42).subscribe();
    const deleteRequest = httpTesting.expectOne('http://api.test/api/events/42');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
  });
});

describe('ReservationService local behavior', () => {
  it('creates a reservation with the matching event and total', () => {
    const reservationService = new ReservationService();
    const event: Event = {
      ...apiEvent,
      fecha_inicio: new Date('2026-10-15T12:00:00'),
      fecha_fin: new Date('2026-10-16T12:00:00'),
    };
    const reservation = reservationService.create(event, 2);

    expect(reservationService.getAll()).toContain(reservation);
    expect(reservation.evento).toBe(event);
    expect(reservation.total).toBe(event.precio * 2);
    expect(reservation.entradas).toBe(2);
  });

  it('rejects reservation quantities outside the supported range', () => {
    const reservationService = new ReservationService();
    const event: Event = {
      ...apiEvent,
      fecha_inicio: new Date('2026-10-15T12:00:00'),
      fecha_fin: new Date('2026-10-16T12:00:00'),
    };

    expect(() => reservationService.create(event, 11)).toThrowError(RangeError);
  });
});
