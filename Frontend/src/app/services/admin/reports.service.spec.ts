import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests reports for the selected year', () => {
    service.getReports(2026).subscribe((reports) => {
      expect(reports.year).toBe(2026);
      expect(reports.summary.eventos).toBe(2);
    });

    const request = http.expectOne(
      (req) => req.url === 'http://localhost:3000/api/admin/reports'
        && req.params.get('year') === '2026'
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      year: 2026,
      summary: {
        clientes: 0,
        agentes: 0,
        administradores: 0,
        reservas: 0,
        eventos: 2,
      },
      monthlyRevenue: [],
      eventReservationsByMonth: [],
      averageRevenueByAgent: [],
      averageRevenueByClient: [],
      eventsByAgentAndCity: [],
      eventsByLocation: [],
      reservationHistory: [],
      canceledReservations: [],
      canceledEvents: [],
    });
  });
});
