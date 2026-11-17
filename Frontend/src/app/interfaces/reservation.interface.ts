import { EventState } from "./event.interface";

export interface Reservation {
  codigo: number;
  fecha: Date;
  total: number | null;
  entradas: number | null;
  observaciones: string;
  estado: ReservationState;
  cliente: {
    identificacion: number;
    nombre: string;
    email: string;
  };
  evento: {
    codigo: number;
    nombre: string;
    descripcion: string | null;
    teatro: string | null;
    ciudad: string;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    capacidad: number | null;
    precio: number | null;
    observaciones: string | null;
    estado: EventState;
  };
}

export type ReservationState = 'Reservada' | 'Confirmada' | 'Cancelada';