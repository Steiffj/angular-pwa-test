import { Injectable, inject } from '@angular/core';
import { MessengerService } from './messenger-service';
import { TableMessengerService } from './table-messenger.service';
import { VisualizationMessengerService } from './visualization-messenger.service';

@Injectable()
export class CombinedMessengerService implements MessengerService {
  readonly table = inject(TableMessengerService);
  readonly visualization = inject(VisualizationMessengerService);

  connect() {
    const worker = new SharedWorker(
      new URL('../workers/shared.worker', import.meta.url),
      {
        name: 'Test PWA Shared Worker',
        type: 'module',
      }
    );

    this.table.connect('combined', worker);
    this.visualization.connect('combined', worker);
  }

  disconnect() {
    this.table.disconnect('combined');
    this.visualization.disconnect('combined');
  }
}
