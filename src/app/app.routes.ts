import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/heroes',
    pathMatch: 'full',
  },
  {
    path: 'heroes',
    loadComponent: () =>
      import('./pages/hero-list/hero-list.component').then(
        (m) => m.HeroListComponent
      ),
  },
  {
    path: 'heroes/add',
    loadComponent: () =>
      import('./pages/hero-form/hero-form.component').then(
        (m) => m.HeroFormComponent
      ),
  },
  {
    path: 'heroes/edit/:id',
    loadComponent: () =>
      import('./pages/hero-form/hero-form.component').then(
        (m) => m.HeroFormComponent
      ),
  },
  {
    path: 'heroes/:id',
    loadComponent: () =>
      import('./pages/hero-detail/hero-detail.component').then(
        (m) => m.HeroDetailComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
