import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Country } from '../interfaces/location.interface';
import { LocationService } from './location.service';

describe('LocationService', () => {
  let service: LocationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LocationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads departments filtered by country', () => {
    service.getDepartments(4).subscribe((departments) => {
      expect(departments.length).toBe(1);
      expect(departments[0].id_pais).toBe(4);
    });

    const request = http.expectOne(
      (req) => req.url === 'http://localhost:3000/api/departments'
        && req.params.get('paisId') === '4'
    );
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 2, id_pais: 4, nombre: 'Valle del Cauca' }]);
  });

  it('creates a country with the expected request body', () => {
    const body = { nombre: 'Colombia' };
    const created: Country = { id: 1, nombre: body.nombre };

    service.createCountry(body).subscribe((country) => {
      expect(country).toEqual(created);
    });

    const request = http.expectOne('http://localhost:3000/api/countries');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush(created);
  });
});
