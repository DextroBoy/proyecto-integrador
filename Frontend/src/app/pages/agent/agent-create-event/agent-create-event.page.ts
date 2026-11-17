import { Component, inject, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { Event, EventPayload, EventState } from '../../../interfaces/event.interface';
import { LocationSelection } from '../../../interfaces/location.interface';
import { LocationSelectorComponent } from '../../../components/location-selector/location-selector.component';
import { getApiErrorMessage } from '../../../services/api-error';
import { EventService } from '../../../services/event.service';

interface EventForm {
  nombre: string;
  teatro: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad: number | null;
  precio: number | null;
  estado: EventState;
  descripcion: string;
  observaciones: string;
}

@Component({
  selector: 'app-agent-create-event.page',
  imports: [FormsModule, RouterLink, LocationSelectorComponent],
  templateUrl: './agent-create-event.page.html',
  styleUrl: './agent-create-event.page.scss',
})
export class AgentCreateEventPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly states: EventState[] = [
    'Programado',
    'En Boleteria',
    'En Vivo',
    'Finalizado',
    'Cancelado',
  ];
  eventForm: EventForm = this.emptyForm();
  eventId: number | null = null;
  currentEvent: Event | null = null;
  selectedCityId: number | null = null;
  loadingEvent = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  get editing(): boolean {
    return this.eventId !== null;
  }

  ngOnInit(): void {
    const rawId = this.route.snapshot.queryParamMap.get('id');
    if (rawId === null) {
      return;
    }

    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id < 1) {
      this.errorMessage = 'El identificador del evento no es válido.';
      return;
    }

    this.eventId = id;
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadingEvent = true;
    this.eventService.getByCode(id).subscribe({
      next: (event) => {
        this.currentEvent = event;
        this.selectedCityId = event.id_ciudad;
        this.eventForm = {
          nombre: event.nombre,
          teatro: event.teatro,
          fecha_inicio: this.dateForInput(event.fecha_inicio),
          fecha_fin: this.dateForInput(event.fecha_fin),
          capacidad: event.capacidad,
          precio: event.precio,
          estado: event.estado,
          descripcion: event.descripcion,
          observaciones: event.observaciones,
        };
        this.loadingEvent = false;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error)
          ?? 'No se pudo cargar el evento para editarlo.';
        this.loadingEvent = false;
      },
    });
  }

  onLocationChange(selection: LocationSelection): void {
    this.selectedCityId = selection.id_ciudad;
    this.errorMessage = '';
  }

  saveEvent(): void {
    if (this.saving) {
      return;
    }
    if (this.selectedCityId === null) {
      this.errorMessage = 'Selecciona la ciudad donde se realizará el evento.';
      return;
    }

    const payload: EventPayload = {
      ...this.eventForm,
      id_ciudad: this.selectedCityId,
      capacidad: Number(this.eventForm.capacidad),
      precio: Number(this.eventForm.precio),
    };
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const request = this.editing && this.eventId !== null
      ? this.eventService.update(this.eventId, payload)
      : this.eventService.create(payload);
    const wasEditing = this.editing;

    request.subscribe({
      next: (event) => {
        this.currentEvent = event;
        this.eventId = event.codigo;
        this.selectedCityId = event.id_ciudad;
        this.successMessage = wasEditing
          ? 'El evento se actualizó correctamente.'
          : 'El evento se creó correctamente.';
        this.saving = false;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error)
          ?? 'No se pudo guardar el evento.';
        this.saving = false;
      },
    });
  }

  private dateForInput(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private emptyForm(): EventForm {
    return {
      nombre: '',
      teatro: '',
      fecha_inicio: '',
      fecha_fin: '',
      capacidad: null,
      precio: null,
      estado: 'Programado',
      descripcion: '',
      observaciones: '',
    };
  }
}
