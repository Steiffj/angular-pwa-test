import { Routes } from '@angular/router';
import { PokemonListComponent } from 'components/pokemon-list/pokemon-list.component';
import { TablePopoutShellComponent } from './table-popout-shell/table-popout-shell.component';
import { CombinedComponent } from './views/combined/combined.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    title: 'Home',
    component: CombinedComponent,
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
        component: PokemonListComponent,
      },
    ],
  },
  {
    path: 'table-standalone',
    pathMatch: 'full',
    title: 'Table (Standalone)',
    loadComponent: () =>
      import('./views/table/table.component').then(
        (m) => m.TableWindowComponent
      ),
  },
  {
    path: 'visualization-standalone',
    pathMatch: 'full',
    title: 'Visualization (Standalone)',
    loadComponent: () =>
      import('./views/visualization/visualization.component').then(
        (m) => m.VisualizationComponent
      ),
  },
];
