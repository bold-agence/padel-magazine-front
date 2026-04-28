import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/pages/pages.routes').then((m) => m.PAGES_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
