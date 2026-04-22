import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
