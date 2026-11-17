import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Event } from '../../../interfaces/event.interface';
import { EventService } from '../../../services/event.service';
import { getApiErrorMessage } from '../../../services/api-error';

@Component({
  selector: 'app-agent-events.page',
  imports: [CommonModule, RouterLink],
  templateUrl: './agent-events.page.html',
  styleUrl: './agent-events.page.scss',
})
export class AgentEventsPage implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly platformId = inject(PLATFORM_ID);

  events: Event[] = [];
  loading = false;
  deletingCode: number | null = null;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const eventMessage = window.history.state?.eventMessage;
      if (typeof eventMessage === 'string') {
        this.successMessage = eventMessage;
      }
    }
    this.loadEvents();
  }

  loadEvents(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.eventService.getAll().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error)
          ?? 'No se pudieron cargar tus eventos.';
        this.loading = false;
      },
    });
  }

  deleteEvent(event: Event): void {
    if (!window.confirm(`¿Eliminar el evento "${event.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.deletingCode = event.codigo;
    this.errorMessage = '';
    this.successMessage = '';
    this.eventService.delete(event.codigo).subscribe({
      next: () => {
        this.events = this.events.filter(({ codigo }) => codigo !== event.codigo);
        this.successMessage = 'El evento se eliminó correctamente.';
        this.deletingCode = null;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error)
          ?? 'No se pudo eliminar el evento.';
        this.deletingCode = null;
      },
    });
  }
}
