import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
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
export class ClientCreateReservationPage implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly reservationService = inject(ReservationService);
  private readonly platformId = inject(PLATFORM_ID);

  event: Event | null = null;
  quantity = 1;
  reserved = false;
  loading = false;
  submitting = false;
  errorMessage = '';
  reservationCode: number | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(id) || id < 1) {
      this.errorMessage = 'El evento solicitado no es válido.';
      return;
    }

    this.loading = true;
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

  getTotal(): number | null {
    if (!this.event || this.event.precio === null) {
      return null;
    }
    return this.event.precio * this.quantity;
  }

  getMoney(value: number | null): string {
    return value === null ? '—' : '$' + value.toLocaleString('es-CO');
  }

  getDate(fecha: Date | null): string {
    if (!fecha) {
      return 'Fecha por definir';
    }
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
    if (!this.canReserve()) {
      this.errorMessage = 'Este evento no tiene los datos necesarios para realizar una reserva.';
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

  canReserve(): boolean {
    return !!this.event &&
      this.event.capacidad !== null &&
      this.event.precio !== null &&
      (this.event.estado === 'Programado' || this.event.estado === 'En Boleteria');
  }

  availabilityMessage(): string {
    if (!this.event) {
      return '';
    }
    if (this.event.estado !== 'Programado' && this.event.estado !== 'En Boleteria') {
      return 'Este evento no está disponible para reservas.';
    }
    if (this.event.capacidad === null || this.event.precio === null) {
      return 'No se puede reservar porque el evento no tiene capacidad o precio configurado.';
    }
    return '';
  }

}