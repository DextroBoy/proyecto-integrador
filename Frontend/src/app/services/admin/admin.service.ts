import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';

export interface Account { identificacion: number; nombre: string; email: string; rol: 'ADMIN' | 'CLIENTE' | 'AGENTE'; direccion: string; id_ciudad: number; }
export type AccountRole = 'personas' | 'clientes' | 'agentes' | 'administradores';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  list(resource: AccountRole): Observable<Account[]> { return this.http.get<Account[]>(`${this.apiUrl}/${resource}`); }
  create(resource: AccountRole, account: Record<string, unknown>): Observable<Account> { return this.http.post<Account>(`${this.apiUrl}/${resource}`, account); }
  update(resource: AccountRole, id: number, account: Record<string, unknown>): Observable<Account> { return this.http.put<Account>(`${this.apiUrl}/${resource}/${id}`, account); }
  remove(resource: AccountRole, id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${resource}/${id}`); }
}
