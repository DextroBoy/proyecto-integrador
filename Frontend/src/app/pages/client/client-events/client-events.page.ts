import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Event } from '../../../interfaces/event.interface';
import { EventCardComponent } from '../../../components/event-card/event-card.component';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { apiErrorMessage } from '../../../services/api-error';

@Component({
  selector: 'app-client-events.page',
  imports: [EventCardComponent, RouterLink],
  templateUrl: './client-events.page.html',
  styleUrl: './client-events.page.scss',
})
export class ClientEventsPage implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly platformId = inject(PLATFORM_ID);

  events: Event[] = [];
  featured: Event[] = [];
  featuredIndex = 0;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loading = true;
    this.eventService.getAll().subscribe({
      next: (events) => {
        this.events = events;
        this.featured = events.slice(0, 3);
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = apiErrorMessage(error);
        this.loading = false;
      },
    });
  }

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

  getPrice(value: number | null): string {
    return value === null ? '—' : '$' + value.toLocaleString('es-CO');
  }

}
