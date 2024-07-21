import { Routes } from '@angular/router';
import { CombinedComponent } from './views/combined/combined.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'combined' },
  {
    path: 'combined',
    title: 'Combined',
    component: CombinedComponent,
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
