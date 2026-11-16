import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Event } from '../../../interfaces/event.interface';
import { EventService } from '../../../services/event.service';
import { ReservationService } from '../../../services/reservation.service';
import { apiErrorMessage } from '../../../services/api-error';

@Component({
  selector: 'app-client-create-reservation.page',
  imports: [RouterLink],
  templateUrl: './client-create-reservation.page.html',
  styleUrl: './client-create-reservation.page.scss',
})
export class ClientCreateReservationPage {

  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private reservationService = inject(ReservationService);

  event: Event | null = null;
  quantity = 1;
  reserved = false;
  loading = true;
  submitting = false;
  errorMessage = '';
  reservationCode: number | null = null;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(id) || id < 1) {
      this.errorMessage = 'El evento solicitado no es válido.';
      this.loading = false;
      return;
    }
    this.eventService.getByCode(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error);
        this.loading = false;
      },
    });
  }

  setQuantity(value: string) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 1) {
      this.quantity = 1;
    } else if (number > 10) {
      this.quantity = 10;
    } else {
      this.quantity = Math.floor(number);
    }
  }

  getTotal(): number {
    return this.event ? this.event.precio * this.quantity : 0;
  }

  getMoney(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }

  getDate(fecha: Date): string {
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  reserve(submitEvent: SubmitEvent): void {
    submitEvent.preventDefault();
    if (!this.event || this.submitting) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.reservationService.create(this.event.codigo, this.quantity).subscribe({
      next: (reservation) => {
        this.reservationCode = reservation.codigo;
        this.reserved = true;
        this.submitting = false;
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error);
        this.submitting = false;
      },
    });
  }

}