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

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses the account CRUD endpoints', () => {
    service.list('clientes').subscribe();
    const list = http.expectOne({ method: 'GET', url: 'http://localhost:3000/api/clientes' });
    expect(list.request.method).toBe('GET');
    list.flush([]);
    service.create('clientes', { identificacion: 7 }).subscribe();
    const create = http.expectOne({ method: 'POST', url: 'http://localhost:3000/api/clientes' });
    expect(create.request.body).toEqual({ identificacion: 7 });
    create.flush({});
    service.update('clientes', 7, { nombre: 'Nuevo' }).subscribe();
    const update = http.expectOne({ method: 'PUT', url: 'http://localhost:3000/api/clientes/7' });
    expect(update.request.body).toEqual({ nombre: 'Nuevo' });
    update.flush({});
    service.remove('clientes', 7).subscribe();
    const remove = http.expectOne({ method: 'DELETE', url: 'http://localhost:3000/api/clientes/7' });
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });
});
