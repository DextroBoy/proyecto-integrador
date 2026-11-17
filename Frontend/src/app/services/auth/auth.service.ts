import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tokenKey = 'eventos_access_token';
  private readonly userKey = 'eventos_user';

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(tap((response) => this.save(response)));
  }
  register(data: { identificacion: number; nombre: string; direccion: string; email: string; password: string; id_ciudad: number }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(tap((response) => this.save(response)));
  }
  token(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(this.tokenKey) : null;
  }
  user(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const raw = localStorage.getItem(this.userKey);
    try { return raw ? JSON.parse(raw) as AuthUser : null; } catch { return null; }
  }
  hasRole(...roles: UserRole[]): boolean { const user = this.user(); return !!user && roles.includes(user.rol); }
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    void this.router.navigate(['/login']);
  }
  private save(response: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }
}
