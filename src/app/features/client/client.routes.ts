import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/client-layout.component').then((m) => m.ClientLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/pages/home.page').then((m) => m.HomePage),
      },
    ],
  },
];
