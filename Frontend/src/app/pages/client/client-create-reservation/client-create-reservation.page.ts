import { Component, inject, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { Event } from '../../../interfaces/event.interface';
import { EventService } from '../../../services/event.service';
import { ReservationService } from '../../../services/reservation.service';
import { getApiErrorMessage } from '../../../services/api-error';

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
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(id) || id < 1) {
      this.errorMessage = 'El evento solicitado no es válido.';
      return;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loading = true;
    this.eventService.getByCode(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error)
          ?? 'No se pudo cargar el evento solicitado.';
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

  reserve(submitEvent: SubmitEvent) {
    submitEvent.preventDefault();

    if (this.event) {
      this.reservationService.create(this.event, this.quantity);
    }

    this.reserved = true;
  }

}