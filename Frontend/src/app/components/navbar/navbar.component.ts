import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth/auth.service';

interface NavbarConfig {
  url: string;
  label: string;
  icon: string;
  fragment?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly authService = inject(AuthService);

  get navbarConfig(): NavbarConfig[] {
    switch (this.authService.user()?.rol) {
      case 'ADMIN':
        return [
          { url: '/admin', fragment: 'admin-accounts', label: 'Cuentas', icon: 'people' },
          { url: '/admin', fragment: 'admin-locations', label: 'Ubicaciones', icon: 'geo-alt' },
          { url: '/admin', fragment: 'admin-reports', label: 'Reportes', icon: 'bar-chart' },
        ];
      case 'AGENTE':
        return [
          { url: '/agent/events', label: 'Eventos registrados', icon: 'calendar3' },
          { url: '/agent/create-event', label: 'Registrar evento', icon: 'plus-circle' },
          { url: '/agent/reservations', label: 'Reservas', icon: 'ticket-perforated' },
        ];
      case 'CLIENTE':
        return [
          { url: '/client/events', label: 'Eventos', icon: 'calendar3' },
          { url: '/client/reservations', label: 'Reservaciones', icon: 'ticket-perforated' },
        ];
      default:
        return [];
    }
  }

  get homeRoute(): string {
    switch (this.authService.user()?.rol) {
      case 'ADMIN':
        return '/admin';
      case 'AGENTE':
        return '/agent/events';
      case 'CLIENTE':
        return '/client/events';
      default:
        return '/login';
    }
  }

  get roleLabel(): string {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Administrador',
      AGENTE: 'Agente',
      CLIENTE: 'Cliente',
    };
    const role = this.authService.user()?.rol;
    return role ? labels[role] : '';
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(): string {
    const name = this.authService.user()?.nombre?.trim();
    return name
      ? name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
      : '';
  }
}
