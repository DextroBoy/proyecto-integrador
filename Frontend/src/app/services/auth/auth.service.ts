import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';

export type UserRole = 'ADMIN' | 'CLIENTE' | 'AGENTE';
export interface AuthUser { identificacion: number; nombre: string; email: string; rol: UserRole; }
export interface AuthResponse { user: AuthUser; token: string; }

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly tokenKey = 'eventos_access_token';
  private readonly userKey = 'eventos_user';

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(tap((response) => this.save(response)));
  }
  register(data: { identificacion: number; nombre: string; direccion: string; email: string; password: string; id_ciudad: number }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(tap((response) => this.save(response)));
  }
  token(): string | null { return localStorage.getItem(this.tokenKey); }
  user(): AuthUser | null { const raw = localStorage.getItem(this.userKey); try { return raw ? JSON.parse(raw) as AuthUser : null; } catch { return null; } }
  hasRole(...roles: UserRole[]): boolean { const user = this.user(); return !!user && roles.includes(user.rol); }
  logout(): void { localStorage.removeItem(this.tokenKey); localStorage.removeItem(this.userKey); void this.router.navigate(['/login']); }
  private save(response: AuthResponse): void { localStorage.setItem(this.tokenKey, response.token); localStorage.setItem(this.userKey, JSON.stringify(response.user)); }
}
