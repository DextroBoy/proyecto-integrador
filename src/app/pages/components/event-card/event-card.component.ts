import { Component, Input } from '@angular/core';
import { Event } from '../../interfaces/event.interface';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-event-card',
  imports: [RouterLink],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss',
})
export class EventCardComponent {
  @Input() event: Event | null=null;


  getStatusClass(): string {
    switch (this.event?.estado) {
      case 'Programado':
        return 'event-card_status - -scheduled';
        case 'En Boleteria':
        return 'event-card_status - -scheduled';
        case 'En Vivo':
        return 'event-card_status - -scheduled';
        case 'Finalizado':
        return 'event-card_status - -scheduled';
        case 'Cancelado':
        return 'event-card_status - -scheduled';
        default:
          return '';
    }
  }

  getDate(): string {
    if (!this.event) {
      return '';
    }
    return this.event.fecha_inicio.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getPrice(): string {
    if (!this.event) {
      return '';
    }
    return '$' + this.event.precio.toLocaleString('es-CO');
  }
}
