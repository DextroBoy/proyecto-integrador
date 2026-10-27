import { Event } from "./event.interface";

export interface Reservation {
  codigo: number;
  fecha: Date;
  total: number;
  entradas: number;
  observaciones: string
  estado: ReservationState;
  evento: Event;
}

export type ReservationState = 'Reservada' | 'Confirmada' | 'Cancelada';