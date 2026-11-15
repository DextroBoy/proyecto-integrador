import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { City, Country, Department } from '../interfaces/location.interface';
import { API_BASE_URL } from './api-base-url';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/countries`);
  }

  getCountry(id: number): Observable<Country> {
    return this.http.get<Country>(`${this.apiUrl}/countries/${id}`);
  }

  createCountry(body: Pick<Country, 'nombre'>): Observable<Country> {
    return this.http.post<Country>(`${this.apiUrl}/countries`, body);
  }

  updateCountry(id: number, body: Pick<Country, 'nombre'>): Observable<Country> {
    return this.http.put<Country>(`${this.apiUrl}/countries/${id}`, body);
  }

  deleteCountry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/countries/${id}`);
  }

  getDepartments(countryId?: number): Observable<Department[]> {
    const params = countryId === undefined
      ? undefined
      : new HttpParams().set('paisId', countryId);
    return this.http.get<Department[]>(`${this.apiUrl}/departments`, { params });
  }

  getDepartment(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/departments/${id}`);
  }

  createDepartment(body: Pick<Department, 'id_pais' | 'nombre'>): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/departments`, body);
  }

  updateDepartment(
    id: number,
    body: Pick<Department, 'id_pais' | 'nombre'>
  ): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/departments/${id}`, body);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/departments/${id}`);
  }

  getCities(departmentId?: number): Observable<City[]> {
    const params = departmentId === undefined
      ? undefined
      : new HttpParams().set('departamentoId', departmentId);
    return this.http.get<City[]>(`${this.apiUrl}/cities`, { params });
  }

  getCity(id: number): Observable<City> {
    return this.http.get<City>(`${this.apiUrl}/cities/${id}`);
  }

  createCity(body: Pick<City, 'id_departamento' | 'nombre'>): Observable<City> {
    return this.http.post<City>(`${this.apiUrl}/cities`, body);
  }

  updateCity(id: number, body: Pick<City, 'id_departamento' | 'nombre'>): Observable<City> {
    return this.http.put<City>(`${this.apiUrl}/cities/${id}`, body);
  }

  deleteCity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cities/${id}`);
  }
}
