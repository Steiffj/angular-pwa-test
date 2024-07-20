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

    this.table.connect(worker);
    this.visualization.connect(worker);
  }

  disconnect() {
    this.table.disconnect();
    this.visualization.disconnect();
  }
}
