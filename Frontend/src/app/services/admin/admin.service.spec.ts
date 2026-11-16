import { TestBed } from '@angular/core/testing';

import { AdminService } from './admin.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('AdminService', () => {
  let service: AdminService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses the account CRUD endpoints', () => {
    service.list('clientes').subscribe();
    http.expectOne({ method: 'GET', url: 'http://localhost:3000/api/clientes' }).flush([]);
    service.create('clientes', { identificacion: 7 }).subscribe();
    http.expectOne({ method: 'POST', url: 'http://localhost:3000/api/clientes' }).flush({});
    service.update('clientes', 7, { nombre: 'Nuevo' }).subscribe();
    http.expectOne({ method: 'PUT', url: 'http://localhost:3000/api/clientes/7' }).flush({});
    service.remove('clientes', 7).subscribe();
    http.expectOne({ method: 'DELETE', url: 'http://localhost:3000/api/clientes/7' }).flush(null);
  });
});
