import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'client',
    renderMode: RenderMode.Client,
  },
  {
    path: 'client/events',
    renderMode: RenderMode.Client,
  },
  {
    path: 'client/reservations',
    renderMode: RenderMode.Client,
  },
  {
    path: 'client/create-reservation',
    renderMode: RenderMode.Client,
  },
  {
    path: 'client/create-reservation/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'agent',
    renderMode: RenderMode.Client,
  },
  {
    path: 'agent/events',
    renderMode: RenderMode.Client,
  },
  {
    path: 'agent/reservations',
    renderMode: RenderMode.Client,
  },
  {
    path: 'agent/create-event',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  }
];
