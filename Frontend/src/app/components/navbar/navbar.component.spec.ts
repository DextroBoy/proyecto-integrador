import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth/auth.service';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let currentUser: AuthUser | null;

  beforeEach(async () => {
    currentUser = null;
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: () => currentUser, logout: () => undefined } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows admin navigation and the correct home route for an administrator', () => {
    currentUser = {
      identificacion: 1,
      nombre: 'Admin User',
      email: 'admin@example.com',
      rol: 'ADMIN',
    };

    fixture.detectChanges();

    expect(component.homeRoute).toBe('/admin');
    expect(fixture.nativeElement.textContent).toContain('Reportes');
    expect(fixture.nativeElement.textContent).toContain('Cerrar sesión');
    expect(fixture.nativeElement.querySelector('a[href="/admin#admin-reports"]')).toBeTruthy();
  });
});
