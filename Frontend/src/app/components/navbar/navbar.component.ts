import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

interface NavbarConfig {
  url: string;
  label: string;
  icon:  string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  navbarConfig: NavbarConfig[] = [];

  clientConfig: NavbarConfig[] = [
    { url: '/client/events', label: 'Eventos', icon: 'calendar3' },
    { url: '/client/reservations', label: 'Reservaciones', icon: 'ticket-perforated'},
  ]

  agentConfig: NavbarConfig[] = [
    { url: '/agent/events', label: 'Eventos', icon: 'calendar3' },
    { url: '/agent/create-event', label: 'Crear Evento', icon: 'plus-circle'},
  ]

  

  constructor(){
    this.setNavbarConfig();
  }

  setNavbarConfig(){
    switch(this.getRole()){
      case 'client':
        this.navbarConfig = this.clientConfig;
        break;
      case 'agent':
        this.navbarConfig = this.agentConfig;
        break;
    }
  }

  getRole(): 'client' | 'agent' | 'admin' {

    const url = this.router.url;

    if (url.includes('/client')) {
      return 'client';
    }

    if (url.includes('/agent')) {
      return 'agent';
    }

    if (url.includes('/admin')) {
      return 'admin';
    }

    return 'client';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    const name = this.authService.user()?.nombre.trim();
    return name
      ? name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
      : '';
  }
}
