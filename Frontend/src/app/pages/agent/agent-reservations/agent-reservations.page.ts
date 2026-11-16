import { Component, inject } from '@angular/core';
import { Reservation, ReservationState } from '../../../interfaces/reservation.interface';
import { ReservationService } from '../../../services/reservation.service';
import { apiErrorMessage } from '../../../services/api-error';

@Component({
  selector: 'app-agent-reservations.page',
  imports: [],
  templateUrl: './agent-reservations.page.html',
  styleUrl: './agent-reservations.page.scss',
})
export class AgentReservationsPage {
  private readonly reservationService = inject(ReservationService);

  readonly states: ReservationState[] = ['Reservada', 'Confirmada', 'Cancelada'];
  reservations: Reservation[] = [];
  pendingStates: Record<number, ReservationState> = {};
  loading = true;
  errorMessage = '';
  successMessage = '';
  updatingId: number | null = null;
  deletingId: number | null = null;

  constructor() {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.errorMessage = '';
    this.reservationService.getAll().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.pendingStates = Object.fromEntries(
          reservations.map((reservation) => [reservation.codigo, reservation.estado]),
        );
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error);
        this.loading = false;
      },
    });
  }

  setPendingState(id: number, event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    const state = target.value as ReservationState;
    if (this.states.includes(state)) {
      this.pendingStates = { ...this.pendingStates, [id]: state };
    }
  }

  updateState(reservation: Reservation): void {
    const state = this.pendingStates[reservation.codigo];
    if (!state || this.updatingId !== null) {
      return;
    }
    if (
      state === 'Cancelada' &&
      reservation.estado !== 'Cancelada' &&
      !globalThis.confirm(`¿Cancelar la reserva #${reservation.codigo}?`)
    ) {
      this.pendingStates = { ...this.pendingStates, [reservation.codigo]: reservation.estado };
      return;
    }

    this.updatingId = reservation.codigo;
    this.errorMessage = '';
    this.successMessage = '';
    this.reservationService.updateState(reservation.codigo, state).subscribe({
      next: (updatedReservation) => {
        this.reservations = this.reservations.map((item) =>
          item.codigo === updatedReservation.codigo ? updatedReservation : item,
        );
        this.pendingStates = {
          ...this.pendingStates,
          [updatedReservation.codigo]: updatedReservation.estado,
        };
        this.successMessage = `La reserva #${updatedReservation.codigo} fue actualizada.`;
        this.updatingId = null;
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error);
        this.pendingStates = { ...this.pendingStates, [reservation.codigo]: reservation.estado };
        this.updatingId = null;
      },
    });
  }

  deleteReservation(reservation: Reservation): void {
    if (
      this.deletingId !== null ||
      !globalThis.confirm(`¿Eliminar permanentemente la reserva #${reservation.codigo}?`)
    ) {
      return;
    }

    this.deletingId = reservation.codigo;
    this.errorMessage = '';
    this.successMessage = '';
    this.reservationService.delete(reservation.codigo).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(
          (item) => item.codigo !== reservation.codigo,
        );
        const { [reservation.codigo]: _removed, ...remainingStates } = this.pendingStates;
        this.pendingStates = remainingStates;
        this.successMessage = `La reserva #${reservation.codigo} fue eliminada.`;
        this.deletingId = null;
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error);
        this.deletingId = null;
      },
    });
  }

  getMoney(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }
}
