export interface ReportsSummary {
  clientes: number;
  agentes: number;
  administradores: number;
  reservas: number;
  eventos: number;
}

export interface MonthlyRevenue {
  mes: number;
  ingresos: number;
}

export interface EventReservationsByMonth {
  evento_id: number;
  evento: string | null;
  mes: number;
  reservas: number;
}

export interface AverageRevenue {
  identificacion: number;
  nombre: string;
  promedio_ingresos: number;
}

export interface EventsByAgentAndCity {
  agente: string;
  ciudad: string;
  eventos: number;
}

export interface EventLocation {
  evento: string;
  pais: string;
  departamento: string;
  ciudad: string;
}

export interface ReservationHistory {
  cliente: string;
  evento: string | null;
  fecha: string | null;
  entradas: number | null;
  estado: string;
}

export interface CanceledReservation {
  reserva_id: number;
  cliente: string;
  evento: string | null;
  causa: string | null;
}

export interface CanceledEvent {
  evento_id: number;
  evento: string | null;
  causa: string | null;
}

export interface AdminReports {
  year: number;
  summary: ReportsSummary;
  monthlyRevenue: MonthlyRevenue[];
  eventReservationsByMonth: EventReservationsByMonth[];
  averageRevenueByAgent: AverageRevenue[];
  averageRevenueByClient: AverageRevenue[];
  eventsByAgentAndCity: EventsByAgentAndCity[];
  eventsByLocation: EventLocation[];
  reservationHistory: ReservationHistory[];
  canceledReservations: CanceledReservation[];
  canceledEvents: CanceledEvent[];
}
