import { Routes } from '@angular/router';
import {LoginPage} from './pages/login/login.page'; 
import {RegisterPage} from './pages/register/register.page';
import {ClientPage} from './pages/client/client.page';
import {AdminPage} from './pages/admin/admin.page';
import {AgentPage} from './pages/agent/agent.page'; 
import { AgentEventsPage } from './pages/agent/agent-events/agent-events.page';
import { AgentReservationsPage } from './pages/agent/agent-reservations/agent-reservations.page';
import { AgentCreateEventPage } from './pages/agent/agent-create-event/agent-create-event.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'client', component: ClientPage },
  { path: 'admin', component: AdminPage },
  { path: 'agent', component: AgentPage },


 {
        path: "agent",
        component: AgentPage,
        children: [
            {
                path: "events",
                component: AgentEventsPage
            },
            {
                path: "reservations",
                component: AgentReservationsPage
            },
            {
                path: "create-event",
                component: AgentCreateEventPage
            },
            {
                path: "",
                redirectTo: "events",
                pathMatch: "full"
            }
        ] },]