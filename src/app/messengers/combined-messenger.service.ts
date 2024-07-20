import { Injectable, inject } from '@angular/core';
import { TableMessengerService } from './table-messenger.service';

@Injectable()
export class CombinedMessengerService {
  readonly table = inject(TableMessengerService);
}
