import { Injectable } from '@angular/core';
import { Event } from '../pages/interfaces/event.interface';
import { Reservation } from '../pages/interfaces/reservation.interface';
import { EventService } from './event.service';

type ReservationMock = Omit<Reservation, 'evento'> & { eventoCodigo: number };

const RESERVATION_MOCKS: ReservationMock[] = [
  {
    codigo: 3001,
    fecha: new Date('2026-10-05T10:15:00'),
    total: 170000,
    entradas: 2,
    observaciones: 'Zona preferencial.',
    estado: 'Confirmada',
    eventoCodigo: 1001,
  },
  {
    codigo: 3002,
    fecha: new Date('2026-10-08T16:40:00'),
    total: 195000,
    entradas: 3,
    observaciones: 'Pendiente de pago.',
    estado: 'Reservada',
    eventoCodigo: 1002,
  },
  {
    codigo: 3004,
    fecha: new Date('2026-10-01T09:05:00'),
    total: 75000,
    entradas: 1,
    observaciones: 'Cancelada por el cliente.',
    estado: 'Cancelada',
    eventoCodigo: 1005,
  },
];

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly reservations: Reservation[];
  private nextCode: number;

  constructor(private readonly eventService: EventService) {
    this.reservations = RESERVATION_MOCKS.map(({ eventoCodigo, ...reservation }) => {
      const event = this.eventService.getByCode(eventoCodigo);

      if (!event) {
        throw new Error(`Mock reservation references missing event ${eventoCodigo}.`);
      }

      return { ...reservation, evento: event };
    });
    this.nextCode = Math.max(...this.reservations.map(({ codigo }) => codigo)) + 1;
  }

  getAll(): Reservation[] {
    return [...this.reservations];
  }

  create(event: Event, entradas: number): Reservation {
    if (!Number.isInteger(entradas) || entradas < 1 || entradas > 10) {
      throw new RangeError('Reservation quantity must be an integer between 1 and 10.');
    }

    const reservation: Reservation = {
      codigo: this.nextCode++,
      fecha: new Date(),
      total: event.precio * entradas,
      entradas,
      observaciones: 'Reserva de demostración.',
      estado: 'Reservada',
      evento: event,
    };

    this.reservations.push(reservation);
    return reservation;
  }
}
