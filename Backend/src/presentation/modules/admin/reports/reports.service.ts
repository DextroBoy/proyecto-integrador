import { CustomError } from "../../../../domain/errors/custom.error";
import {
  AverageRevenue,
  CanceledEvent,
  CanceledReservation,
  EventLocation,
  EventReservationsByMonth,
  EventsByAgentAndCity,
  MonthlyRevenue,
  ReportsModel,
  ReportsSummary,
  ReservationHistory,
} from "./reports.model";

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

export class ReportsService {
  constructor(private readonly model = new ReportsModel()) {}

  async getReports(rawYear: unknown): Promise<AdminReports> {
    const year = this.parseYear(rawYear);
    const [
      summary,
      monthlyRevenue,
      eventReservationsByMonth,
      averageRevenueByAgent,
      averageRevenueByClient,
      eventsByAgentAndCity,
      eventsByLocation,
      reservationHistory,
      canceledReservations,
      canceledEvents,
    ] = await Promise.all([
      this.model.getSummary(),
      this.model.getMonthlyRevenue(year),
      this.model.getEventReservationsByMonth(year),
      this.model.getAverageRevenueByAgent(year),
      this.model.getAverageRevenueByClient(year),
      this.model.getEventsByAgentAndCity(year),
      this.model.getEventsByLocation(year),
      this.model.getReservationHistory(year),
      this.model.getCanceledReservations(year),
      this.model.getCanceledEvents(year),
    ]);

    return {
      year,
      summary,
      monthlyRevenue,
      eventReservationsByMonth,
      averageRevenueByAgent,
      averageRevenueByClient,
      eventsByAgentAndCity,
      eventsByLocation,
      reservationHistory,
      canceledReservations,
      canceledEvents,
    };
  }

  private parseYear(value: unknown): number {
    if (value === undefined) {
      return new Date().getFullYear();
    }
    if (typeof value !== "string" || !/^\d{4}$/.test(value)) {
      throw CustomError.badRequest("El año debe tener cuatro dígitos.");
    }
    const year = Number(value);
    if (year < 1900 || year > 9999) {
      throw CustomError.badRequest("El año debe estar entre 1900 y 9999.");
    }
    return year;
  }
}
