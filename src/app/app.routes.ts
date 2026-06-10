import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Projects } from './pages/projects/projects';
import { Tasks } from './pages/tasks/tasks';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'projects', component: Projects },
  { path: 'tasks', component: Tasks },
];