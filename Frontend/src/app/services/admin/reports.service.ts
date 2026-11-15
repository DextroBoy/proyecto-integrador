import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminReports } from '../../interfaces/admin-reports.interface';
import { API_BASE_URL } from '../api-base-url';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getReports(year: number): Observable<AdminReports> {
    const params = new HttpParams().set('year', year);
    return this.http.get<AdminReports>(`${this.apiUrl}/admin/reports`, { params });
  }
}
