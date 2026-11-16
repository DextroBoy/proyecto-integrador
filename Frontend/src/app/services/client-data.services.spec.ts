import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { EventService } from './event.service';
import { ReservationService } from './reservation.service';
import { API_BASE_URL } from './api.config';

describe('Client API services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads events from the API and converts event dates', () => {
    const service = TestBed.inject(EventService);
    let receivedStartDate: Date | undefined;

    service.getAll().subscribe(([event]) => {
      receivedStartDate = event?.fecha_inicio;
    });
    http.expectOne(`${API_BASE_URL}/events`).flush([
      {
        codigo: 9,
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

  it('creates reservations without accepting a client ID from the browser', () => {
    const service = TestBed.inject(ReservationService);
    service.create(9, 2).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/reservations`);
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
    const update = http.expectOne(`${API_BASE_URL}/reservations/41`);
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
    const deletion = http.expectOne(`${API_BASE_URL}/reservations/41`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null);
  });
});
