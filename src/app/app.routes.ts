import { Routes } from '@angular/router';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { StorageMetricsComponent } from './storage-metrics/storage-metrics.component';

export const routes: Routes = [
  { path: 'table', title: 'Data Explorer', component: PokemonListComponent },
  {
    path: 'metrics',
    title: 'Storage Metrics',
    component: StorageMetricsComponent,
  },
];
