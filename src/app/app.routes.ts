import { Routes } from '@angular/router';
import {LoginPage} from './pages/login/login.page'; 
import {RegisterPage} from './pages/register/register.page';
import {ClientPage} from './pages/client/client.page';
import {AdminPage} from './pages/admin/admin.page';
import {AgentPage} from './pages/agent/agent.page'; 

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'client', component: ClientPage },
  { path: 'admin', component: AdminPage },
  { path: 'agent', component: AgentPage }
];
