import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { LocationSelection } from '../../interfaces/location.interface';
import { getApiErrorMessage } from '../../services/api-error';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-selector.component.html',
  styleUrl: './location-selector.component.scss',
})
export class LocationSelectorComponent implements OnInit {
  private static nextInstanceId = 0;
  private readonly locationService = inject(LocationService);

  @Output() readonly selectionChange = new EventEmitter<LocationSelection>();

  readonly idPrefix = `location-${LocationSelectorComponent.nextInstanceId++}`;
  countryOptions: { id: number; nombre: string }[] = [];
  departmentOptions: { id: number; id_pais: number; nombre: string }[] = [];
  cityOptions: { id: number; id_departamento: number; nombre: string }[] = [];
  selection: LocationSelection = {
    id_pais: null,
    id_departamento: null,
    id_ciudad: null,
  };
  errorMessage = '';
  loadingCountries = false;
  loadingDepartments = false;
  loadingCities = false;

  ngOnInit(): void {
    this.loadCountries();
  }

  selectCountry(rawId: string): void {
    const id = this.parseSelectedId(rawId);
    this.selection = { id_pais: id, id_departamento: null, id_ciudad: null };
    this.departmentOptions = [];
    this.cityOptions = [];
    this.emitSelection();

    if (id === null) {
      return;
    }

    this.loadingDepartments = true;
    this.locationService.getDepartments(id).subscribe({
      next: (departments) => {
        this.departmentOptions = departments;
        this.loadingDepartments = false;
      },
      error: (error: unknown) => {
        this.setError(error);
        this.loadingDepartments = false;
      },
    });
  }

  selectDepartment(rawId: string): void {
    const id = this.parseSelectedId(rawId);
    this.selection = { ...this.selection, id_departamento: id, id_ciudad: null };
    this.cityOptions = [];
    this.emitSelection();

    if (id === null) {
      return;
    }

    this.loadingCities = true;
    this.locationService.getCities(id).subscribe({
      next: (cities) => {
        this.cityOptions = cities;
        this.loadingCities = false;
      },
      error: (error: unknown) => {
        this.setError(error);
        this.loadingCities = false;
      },
    });
  }

  selectCity(rawId: string): void {
    this.selection = {
      ...this.selection,
      id_ciudad: this.parseSelectedId(rawId),
    };
    this.emitSelection();
  }

  private loadCountries(): void {
    this.loadingCountries = true;
    this.locationService.getCountries().subscribe({
      next: (countries) => {
        this.countryOptions = countries;
        this.loadingCountries = false;
      },
      error: (error: unknown) => {
        this.setError(error);
        this.loadingCountries = false;
      },
    });
  }

  private emitSelection(): void {
    this.errorMessage = '';
    this.selectionChange.emit({ ...this.selection });
  }

  private parseSelectedId(rawId: string): number | null {
    if (!rawId) {
      return null;
    }
    const parsed = Number(rawId);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private setError(error: unknown): void {
    this.errorMessage = getApiErrorMessage(error)
      ?? 'No se pudieron cargar las ubicaciones. Intenta nuevamente.';
  }
}
