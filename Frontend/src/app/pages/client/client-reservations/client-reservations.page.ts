import { Component, inject } from '@angular/core';
import { Reservation, ReservationState } from '../../../interfaces/reservation.interface';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-client-reservations.page',
  imports: [],
  templateUrl: './client-reservations.page.html',
  styleUrl: './client-reservations.page.scss',
})
export class ClientReservationsPage {
  private readonly reservationService = inject(ReservationService);

  reservations: Reservation[] = this.reservationService.getAll();

  getStatusClass(estado: ReservationState): string {
    switch (estado) {
      case 'Reservada':
        return 'reservation-status--reserved';
      case 'Confirmada':
        return 'reservation-status--confirmed';
      case 'Cancelada':
        return 'reservation-status--cancelled';
      default:
        return '';
    }
  }

  getDate(fecha: Date): string {
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getMoney(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }

}
