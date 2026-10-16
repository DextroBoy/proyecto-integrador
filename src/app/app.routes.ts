import { Routes } from '@angular/router';
import {LoginPage} from './pages/login/login.page'; 
import {RegisterPage} from './pages/register/register.page';
import {ClientPage} from './pages/client/client.page';
import {AdminPage} from './pages/admin/admin.page';
import {AgentPage} from './pages/agent/agent.page'; 
import { ClientEventsPage } from './pages/client-events/client-events.page';
import { ClientReservationsPage } from './pages/client-reservations/client-reservations.page';
import { ClientCreateReservationPage } from './pages/client-create-reservation/client-create-reservation.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'client', component: ClientPage ,
    children: [
            {
                path: "events",
                component: ClientEventsPage
            },
            {
                path: "reservations",
                component: ClientReservationsPage
            },
            {
                path: "create-reservation/:id",
                component: ClientCreateReservationPage
            },
            {
                path: "",
                redirectTo: "events",
                pathMatch: "full"
            }
        ]
    },
  { path: 'admin', component: AdminPage },
  { path: 'agent', component: AgentPage }
];
