import { Component, inject } from '@angular/core';
import { Reservation, ReservationState } from '../../../interfaces/reservation.interface';
import { ReservationService } from '../../../services/reservation.service';
import { apiErrorMessage } from '../../../services/api-error';

@Component({
  selector: 'app-client-reservations.page',
  imports: [],
  templateUrl: './client-reservations.page.html',
  styleUrl: './client-reservations.page.scss',
})
export class ClientReservationsPage {
  private readonly reservationService = inject(ReservationService);

  reservations: Reservation[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  updatingId: number | null = null;

  constructor() {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.errorMessage = '';
    this.reservationService.getAll().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error);
        this.loading = false;
      },
    });
  }

  cancelReservation(reservation: Reservation): void {
    if (
      reservation.estado === 'Cancelada' ||
      !globalThis.confirm(`¿Cancelar la reserva #${reservation.codigo}?`)
    ) {
      return;
    }

    this.updatingId = reservation.codigo;
    this.errorMessage = '';
    this.successMessage = '';
    this.reservationService.updateState(reservation.codigo, 'Cancelada').subscribe({
      next: (updatedReservation) => {
        this.reservations = this.reservations.map((item) =>
          item.codigo === updatedReservation.codigo ? updatedReservation : item,
        );
        this.successMessage = `La reserva #${updatedReservation.codigo} fue cancelada.`;
        this.updatingId = null;
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error);
        this.updatingId = null;
      },
    });
  }

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
