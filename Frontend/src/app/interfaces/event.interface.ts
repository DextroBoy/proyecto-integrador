export interface Event {
  codigo: number;
  identificacion: number;
  id_ciudad: number;
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
}

export interface EventPayload {
  id_ciudad: number;
  nombre: string;
  descripcion: string;
  teatro: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad: number;
  precio: number;
  observaciones: string;
  estado: EventState;
}

export type EventState =
    | 'Programado'
    | 'En Boleteria'
    | 'En Vivo'
    | 'Finalizado'
    | 'Cancelado';
