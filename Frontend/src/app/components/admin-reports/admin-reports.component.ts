import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminReports } from '../../interfaces/admin-reports.interface';
import { getApiErrorMessage } from '../../services/api-error';
import { ReportsService } from '../../services/admin/reports.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.scss',
})
export class AdminReportsComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);

  reports: AdminReports | null = null;
  year = new Date().getFullYear();
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.errorMessage = '';
    this.reportsService.getReports(this.year).subscribe({
      next: (reports) => {
        this.reports = reports;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error)
          ?? 'No se pudieron cargar los reportes. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  monthName(month: number): string {
    return new Intl.DateTimeFormat('es-CO', { month: 'long' })
      .format(new Date(2000, month - 1, 1));
  }

  money(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
