import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Event } from '../interfaces/event.interface';

@Component({
  selector: 'app-client-create-reservation.page',
  imports: [RouterLink],
  templateUrl: './client-create-reservation.page.html',
  styleUrl: './client-create-reservation.page.scss',
})
export class ClientCreateReservationPage {

  private route = inject(ActivatedRoute);

  event: Event | null = null;
  quantity = 1;
  reserved = false;

  events: Event[] = [
    {
      codigo: 2001,
      nombre: 'Noche de Salsa en Vivo',
      descripcion: 'Orquestas locales e invitados especiales en una noche para bailar.',
      teatro: 'Club Social Pacífico',
      ciudad: 'Cali',
      fecha_inicio: new Date('2026-11-14T20:00:00'),
      fecha_fin: new Date('2026-11-15T01:00:00'),
      capacidad: 1500,
      precio: 70000,
      observaciones: 'Se recomienda llegar con 30 minutos de anticipación.',
      estado: 'En Boleteria'
    },
    {
      codigo: 2002,
      nombre: 'Festival de Cine Independiente',
      descripcion: 'Muestra de cortometrajes y largometrajes de directores emergentes.',
      teatro: 'Teatro Municipal',
      ciudad: 'Cali',
      fecha_inicio: new Date('2026-11-20T16:00:00'),
      fecha_fin: new Date('2026-11-20T22:00:00'),
      capacidad: 800,
      precio: 40000,
      observaciones: 'Incluye conversatorio con los directores.',
      estado: 'Programado'
    },
    {
      codigo: 2003,
      nombre: 'Stand Up Comedy Tour',
      descripcion: 'Una noche de humor con los comediantes más reconocidos del país.',
      teatro: 'Auditorio Central',
      ciudad: 'Tuluá',
      fecha_inicio: new Date('2026-10-14T19:30:00'),
      fecha_fin: new Date('2026-10-14T22:00:00'),
      capacidad: 600,
      precio: 55000,
      observaciones: 'Evento en desarrollo. No se permite el ingreso con cámaras.',
      estado: 'En Vivo'
    },
    {
      codigo: 2004,
      nombre: 'Ópera: La Traviata',
      descripcion: 'Montaje clásico interpretado por la compañía lírica regional.',
      teatro: 'Teatro Enrique Buenaventura',
      ciudad: 'Cali',
      fecha_inicio: new Date('2026-10-02T19:00:00'),
      fecha_fin: new Date('2026-10-02T22:00:00'),
      capacidad: 900,
      precio: 90000,
      observaciones: 'Evento finalizado.',
      estado: 'Finalizado'
    },
    {
      codigo: 2005,
      nombre: 'Gran Concierto de Vallenato',
      descripcion: 'Presentación de los mejores exponentes del vallenato tradicional.',
      teatro: 'Coliseo de Ferias',
      ciudad: 'Tuluá',
      fecha_inicio: new Date('2026-10-09T20:00:00'),
      fecha_fin: new Date('2026-10-10T00:30:00'),
      capacidad: 4000,
      precio: 80000,
      observaciones: 'Cancelado por motivos logísticos. Se devolverá el dinero.',
      estado: 'Cancelado'
    }
  ];

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.event = this.events.find(item => item.codigo === id) ?? null;
  }

  setQuantity(value: string) {
    const number = Number(value);

    if (number < 1) {
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
    this.reserved = true;
  }

}