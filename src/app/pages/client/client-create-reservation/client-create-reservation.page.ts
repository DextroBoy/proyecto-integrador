import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Event } from '../../interfaces/event.interface';
import { EventService } from '../../../services/event.service';
import { ReservationService } from '../../../services/reservation.service';

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

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.event = this.eventService.getByCode(id) ?? null;
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