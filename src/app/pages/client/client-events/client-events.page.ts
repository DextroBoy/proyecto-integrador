import { Component, inject } from '@angular/core';
import { Event } from '../../interfaces/event.interface';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-client-events.page',
  imports: [EventCardComponent, RouterLink],
  templateUrl: './client-events.page.html',
  styleUrl: './client-events.page.scss',
})
export class ClientEventsPage {
  private readonly eventService = inject(EventService);

  events: Event[] = this.eventService.getAll();
  featured: Event[] = this.events.slice(0, 3);
  featuredIndex = 0;

  getFeatured(): Event | undefined {
    return this.featured[this.featuredIndex];
  }

  nextFeatured() {
    if (this.featured.length > 0) {
      this.featuredIndex = (this.featuredIndex + 1) % this.featured.length;
    }
  }

  previousFeatured() {
    if (this.featured.length > 0) {
      this.featuredIndex =
        (this.featuredIndex - 1 + this.featured.length) % this.featured.length;
    }
  }

  setFeatured(index: number) {
    if (index >= 0 && index < this.featured.length) {
      this.featuredIndex = index;
    }
  }

  getDate(fecha: Date): string {
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  getPrice(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }

}
