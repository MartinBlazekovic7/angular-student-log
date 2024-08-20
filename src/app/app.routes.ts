import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/authentication/authentication.component').then(
        (m) => m.AuthenticationComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history.component').then(
        (m) => m.HistoryComponent
      ),
  },
  {
    path: 'teams',
    loadComponent: () =>
      import('./pages/teams/teams.component').then((m) => m.TeamsComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
