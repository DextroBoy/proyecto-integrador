import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('stores the token after a successful login without exposing a password', () => {
    service.login('user@example.com', 'secret123').subscribe();
    const request = http.expectOne('http://localhost:3000/api/auth/login');
    expect(request.request.body).toEqual({ email: 'user@example.com', password: 'secret123' });
    request.flush({ user: { identificacion: 1, nombre: 'User', email: 'user@example.com', rol: 'CLIENTE' }, token: 'token' });
    expect(service.token()).toBe('token');
    expect(service.user()?.rol).toBe('CLIENTE');
    expect(service.user()).not.toHaveProperty('password');
  });
});
