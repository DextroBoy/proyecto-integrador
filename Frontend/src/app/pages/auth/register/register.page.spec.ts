import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LocationService } from '../../../services/location.service';
import { AuthResponse, AuthService } from '../../../services/auth/auth.service';

import { RegisterPage } from './register.page';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let register: jasmine.Spy;

  beforeEach(async () => {
    register = jasmine.createSpy('register').and.returnValue(of({} as AuthResponse));
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { register } },
        { provide: LocationService, useValue: { getCountries: () => of([]) } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires a selected city and sends its ID with the registration', () => {
    component.form.setValue({
      identificacion: 4001,
      nombre: 'Nuevo Cliente',
      direccion: 'Calle 1',
      email: 'cliente@example.com',
      password: 'secret123',
      confirmarPassword: 'secret123',
    });

    component.submit();
    expect(register).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Selecciona el país');

    component.onLocationChange({ id_pais: 1, id_departamento: 2, id_ciudad: 3 });
    component.submit();

    expect(register).toHaveBeenCalledWith({
      identificacion: 4001,
      nombre: 'Nuevo Cliente',
      direccion: 'Calle 1',
      email: 'cliente@example.com',
      password: 'secret123',
      id_ciudad: 3,
    });
  });
});
