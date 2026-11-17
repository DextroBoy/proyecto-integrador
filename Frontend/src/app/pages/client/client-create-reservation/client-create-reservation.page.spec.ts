import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { ReservationService } from '../../../services/reservation.service';

import { ClientCreateReservationPage } from './client-create-reservation.page';

describe('ClientCreateReservationPage', () => {
  let component: ClientCreateReservationPage;
  let fixture: ComponentFixture<ClientCreateReservationPage>;
  const eventService = jasmine.createSpyObj('EventService', ['getByCode']);
  const reservationService = jasmine.createSpyObj('ReservationService', ['create']);

  beforeEach(async () => {
    eventService.getByCode.and.returnValue(of({
      codigo: 1,
      identificacion: 7,
      id_ciudad: 1,
      nombre: 'Evento',
      descripcion: 'Descripción',
      teatro: 'Teatro',
      ciudad: 'Cali',
      fecha_inicio: new Date('2026-11-20T12:00:00'),
      fecha_fin: new Date('2026-11-20T12:00:00'),
      capacidad: 100,
      precio: 50000,
      observaciones: '',
      estado: 'Programado',
    }));
    reservationService.create.and.returnValue(of({
      codigo: 1,
      fecha: new Date('2026-11-15T12:00:00'),
      total: 50000,
      entradas: 1,
      observaciones: '',
      estado: 'Reservada',
      cliente: { identificacion: 10, nombre: 'Cliente', email: 'cliente@example.com' },
      evento: {
        codigo: 1,
        identificacion: 7,
        id_ciudad: 1,
        nombre: 'Evento',
        descripcion: 'Descripción',
        teatro: 'Teatro',
        ciudad: 'Cali',
        fecha_inicio: new Date('2026-11-20T12:00:00'),
        fecha_fin: new Date('2026-11-20T12:00:00'),
        capacidad: 100,
        precio: 50000,
        observaciones: '',
        estado: 'Programado',
      },
    }));

    await TestBed.configureTestingModule({
      imports: [ClientCreateReservationPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: EventService, useValue: eventService },
        { provide: ReservationService, useValue: reservationService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientCreateReservationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
