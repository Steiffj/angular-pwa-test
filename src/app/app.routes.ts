import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { StorageMetricsComponent } from './storage-metrics/storage-metrics.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home' },
  {
    path: 'home',
    title: 'Home',
    component: HomeComponent,
    children: [
      {
        path: 'table',
        title: 'Data Explorer',
        component: PokemonListComponent,
      },
      {
        path: 'metrics',
        title: 'Storage Metrics',
        component: StorageMetricsComponent,
      },
    ],
  },
  {
    path: 'table-standalone',
    title: 'Table (Standalone)',
    component: PokemonListComponent,
  },
];
