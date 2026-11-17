import { Injectable } from '@angular/core';
import { Event } from '../interfaces/event.interface';
import { Reservation } from '../interfaces/reservation.interface';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly reservations: Reservation[] = [];
  private nextCode = 1;

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
