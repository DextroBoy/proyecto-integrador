import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Event, EventPayload } from '../interfaces/event.interface';
import { API_BASE_URL } from './api-base-url';
import { EventService } from './event.service';
import { ReservationService } from './reservation.service';

describe('Client API services', () => {
  let http: HttpTestingController;
  const apiUrl = 'http://api.test/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: apiUrl },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads events from the API and converts event dates', () => {
    const service = TestBed.inject(EventService);
    let receivedStartDate: Date | null | undefined;

    service.getAll().subscribe((events) => {
      receivedStartDate = events[0]?.fecha_inicio;
    });

    http.expectOne(`${apiUrl}/events`).flush([
      {
        codigo: 9,
        identificacion: 7,
        id_ciudad: 1,
        nombre: 'Evento real',
        descripcion: 'Descripción',
        teatro: 'Teatro',
        ciudad: 'Cali',
        fecha_inicio: '2026-11-20',
        fecha_fin: '2026-11-20',
        capacidad: 100,
        precio: 50000,
        observaciones: '',
        estado: 'Programado',
      },
    ]);

    expect(receivedStartDate instanceof Date).toBeTrue();
    expect(receivedStartDate?.toISOString()).toContain('2026-11-20');
  });

  it('uses the API CRUD endpoints for events', () => {
    const service = TestBed.inject(EventService);
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
    const createRequest = http.expectOne(`${apiUrl}/events`);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual(payload);
    createRequest.flush({
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
      estado: 'Programado',
    });

    service.update(42, payload).subscribe();
    const updateRequest = http.expectOne(`${apiUrl}/events/42`);
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush({
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
      estado: 'Programado',
    });

    service.delete(42).subscribe();
    const deleteRequest = http.expectOne(`${apiUrl}/events/42`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
  });

  it('creates reservations without accepting a client ID from the browser', () => {
    const service = TestBed.inject(ReservationService);
    service.create(9, 2).subscribe();

    const request = http.expectOne(`${apiUrl}/reservations`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      id_evento: 9,
      entradas: 2,
      observacion: '',
    });
    request.flush({
      codigo: 41,
      fecha: '2026-11-15',
      total: 100000,
      entradas: 2,
      observaciones: '',
      estado: 'Reservada',
      cliente: { identificacion: 3010, nombre: 'Cliente', email: 'cliente@example.com' },
      evento: {
        codigo: 9,
        identificacion: 7,
        id_ciudad: 1,
        nombre: 'Evento real',
        descripcion: 'Descripción',
        teatro: 'Teatro',
        ciudad: 'Cali',
        fecha_inicio: '2026-11-20',
        fecha_fin: '2026-11-20',
        capacidad: 100,
        precio: 50000,
        observaciones: '',
        estado: 'Programado',
      },
    });
  });

  it('uses the CRUD API paths for updates and deletes', () => {
    const service = TestBed.inject(ReservationService);
    service.updateState(41, 'Confirmada').subscribe();
    const update = http.expectOne(`${apiUrl}/reservations/41`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual({ estado: 'Confirmada' });
    update.flush({
      codigo: 41,
      fecha: '2026-11-15',
      total: 100000,
      entradas: 2,
      observaciones: '',
      estado: 'Confirmada',
      cliente: { identificacion: 3010, nombre: 'Cliente', email: 'cliente@example.com' },
      evento: {
        codigo: 9,
        identificacion: 7,
        id_ciudad: 1,
        nombre: 'Evento real',
        descripcion: 'Descripción',
        teatro: 'Teatro',
        ciudad: 'Cali',
        fecha_inicio: '2026-11-20',
        fecha_fin: '2026-11-20',
        capacidad: 100,
        precio: 50000,
        observaciones: '',
        estado: 'Programado',
      },
    });

    service.delete(41).subscribe();
    const deletion = http.expectOne(`${apiUrl}/reservations/41`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null);
  });
});
