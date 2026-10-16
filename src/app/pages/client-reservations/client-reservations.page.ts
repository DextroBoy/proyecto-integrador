import { Component } from '@angular/core';
import { Reservation, ReservationState } from '../interfaces/reservation.interface';


@Component({
  selector: 'app-client-reservations.page',
  imports: [],
  templateUrl: './client-reservations.page.html',
  styleUrl: './client-reservations.page.scss',
})
export class ClientReservationsPage {

  reservations: Reservation[] = [
     {
      codigo: 0,
      fecha: new Date('2026-10-05T10:15:00'),
      total: 140000,
      entradas: 2,
      observaciones: 'Zona preferencial.',
      estado: 'Confirmada',
      evento: {
        codigo: 0,
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
      }
    },
    {
      codigo: 0 ,
      fecha: new Date('2026-10-08T16:40:00'),
      total: 120000,
      entradas: 3,
      observaciones: 'Pendiente de pago.',
      estado: 'Reservada',
      evento: {
        codigo: 0 ,
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
      }
    },
    {
      codigo: 0,
      fecha: new Date('2026-10-01T09:05:00'),
      total: 80000,
      entradas: 1,
      observaciones: 'Cancelada por el cliente.',
      estado: 'Cancelada',
      evento: {
        codigo: 0,
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
    }
  ];

  getStatusClass(estado: ReservationState): string {
    switch (estado) {
      case 'Reservada':
        return 'reservation-status--reserved';
      case 'Confirmada':
        return 'reservation-status--confirmed';
      case 'Cancelada':
        return 'reservation-status--cancelled';
      default:
        return '';
    }
  }

  getDate(fecha: Date): string {
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getMoney(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }

}

  