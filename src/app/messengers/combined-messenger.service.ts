import { Injectable, inject } from '@angular/core';
import { MessengerService } from './messenger-service';
import { TableMessengerService } from './table-messenger.service';
import { VisualizationMessengerService } from './visualization-messenger.service';

@Injectable()
export class CombinedMessengerService implements MessengerService {
  readonly table = inject(TableMessengerService);
  readonly visualization = inject(VisualizationMessengerService);

  connect() {
    this.visualization.connect('combined');
    this.table.connect('combined');
  }

  disconnect() {
    this.table.disconnect('combined');
    this.visualization.disconnect('combined');
  }
}
