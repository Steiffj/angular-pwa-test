import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TablePopoutShellComponent } from './table-popout-shell/table-popout-shell.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    title: 'Home',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: TablePopoutShellComponent,
      },
      {
        path: 'table-popout',
        redirectTo: '',
      },
      {
        path: 'table',
        title: 'Table',
        loadComponent: () =>
          import('./pokemon-list/pokemon-list.component').then(
            (m) => m.PokemonListComponent
          ),
      },
    ],
  },
  {
    path: 'table-standalone',
    pathMatch: 'full',
    title: 'Table (Standalone)',
    loadComponent: () =>
      import('./table-window/table-window.component').then(
        (m) => m.TableWindowComponent
      ),
  },
];
