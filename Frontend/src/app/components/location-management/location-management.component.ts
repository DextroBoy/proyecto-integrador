import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import {
  City,
  Country,
  Department,
} from '../../interfaces/location.interface';
import { getApiErrorMessage } from '../../services/api-error';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-location-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-management.component.html',
  styleUrl: './location-management.component.scss',
})
export class LocationManagementComponent implements OnInit {
  private readonly locationService = inject(LocationService);

  countries: Country[] = [];
  departments: Department[] = [];
  cities: City[] = [];
  errorMessage = '';
  successMessage = '';
  loading = false;

  countryName = '';
  countryEditId: number | null = null;
  departmentName = '';
  departmentCountryId: number | null = null;
  departmentEditId: number | null = null;
  cityName = '';
  cityDepartmentId: number | null = null;
  cityEditId: number | null = null;

  ngOnInit(): void {
    this.loadLocations();
  }

  saveCountry(): void {
    const body = { nombre: this.countryName.trim() };
    const request = this.countryEditId === null
      ? this.locationService.createCountry(body)
      : this.locationService.updateCountry(this.countryEditId, body);
    this.runMutation(request, 'País guardado correctamente.', () => {
      this.countryName = '';
      this.countryEditId = null;
    });
  }

  editCountry(country: Country): void {
    this.countryName = country.nombre;
    this.countryEditId = country.id;
  }

  deleteCountry(country: Country): void {
    if (!window.confirm(`¿Eliminar el país ${country.nombre}?`)) {
      return;
    }
    this.runMutation(
      this.locationService.deleteCountry(country.id),
      'País eliminado correctamente.'
    );
  }

  saveDepartment(): void {
    if (this.departmentCountryId === null) {
      this.errorMessage = 'Selecciona el país del departamento.';
      return;
    }
    const body = {
      id_pais: this.departmentCountryId,
      nombre: this.departmentName.trim(),
    };
    const request = this.departmentEditId === null
      ? this.locationService.createDepartment(body)
      : this.locationService.updateDepartment(this.departmentEditId, body);
    this.runMutation(request, 'Departamento guardado correctamente.', () => {
      this.departmentName = '';
      this.departmentCountryId = null;
      this.departmentEditId = null;
    });
  }

  editDepartment(department: Department): void {
    this.departmentName = department.nombre;
    this.departmentCountryId = department.id_pais;
    this.departmentEditId = department.id;
  }

  deleteDepartment(department: Department): void {
    if (!window.confirm(`¿Eliminar el departamento ${department.nombre}?`)) {
      return;
    }
    this.runMutation(
      this.locationService.deleteDepartment(department.id),
      'Departamento eliminado correctamente.'
    );
  }

  saveCity(): void {
    if (this.cityDepartmentId === null) {
      this.errorMessage = 'Selecciona el departamento de la ciudad.';
      return;
    }
    const body = {
      id_departamento: this.cityDepartmentId,
      nombre: this.cityName.trim(),
    };
    const request = this.cityEditId === null
      ? this.locationService.createCity(body)
      : this.locationService.updateCity(this.cityEditId, body);
    this.runMutation(request, 'Ciudad guardada correctamente.', () => {
      this.cityName = '';
      this.cityDepartmentId = null;
      this.cityEditId = null;
    });
  }

  editCity(city: City): void {
    this.cityName = city.nombre;
    this.cityDepartmentId = city.id_departamento;
    this.cityEditId = city.id;
  }

  deleteCity(city: City): void {
    if (!window.confirm(`¿Eliminar la ciudad ${city.nombre}?`)) {
      return;
    }
    this.runMutation(
      this.locationService.deleteCity(city.id),
      'Ciudad eliminada correctamente.'
    );
  }

  countryNameById(id: number): string {
    return this.countries.find((country) => country.id === id)?.nombre ?? `#${id}`;
  }

  departmentNameById(id: number): string {
    return this.departments.find((department) => department.id === id)?.nombre ?? `#${id}`;
  }

  private loadLocations(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      countries: this.locationService.getCountries(),
      departments: this.locationService.getDepartments(),
      cities: this.locationService.getCities(),
    }).subscribe({
      next: ({ countries, departments, cities }) => {
        this.countries = countries;
        this.departments = departments;
        this.cities = cities;
        this.loading = false;
      },
      error: (error: unknown) => this.finishLoadWithError(error),
    });
  }

  private runMutation<T>(
    request: Observable<T>,
    message: string,
    afterSuccess: () => void = () => undefined
  ): void {
    this.errorMessage = '';
    this.successMessage = '';
    request.subscribe({
      next: () => {
        afterSuccess();
        this.successMessage = message;
        this.loadLocations();
      },
      error: (error: unknown) => this.setError(error),
    });
  }

  private finishLoadWithError(error: unknown): void {
    this.loading = false;
    this.setError(error);
  }

  private setError(error: unknown): void {
    this.errorMessage = getApiErrorMessage(error)
      ?? 'No se pudo completar la operación. Intenta nuevamente.';
  }
}
