import { ViewName } from 'views/view-name';

export interface MessengerService {
  connect(view: ViewName): void;
  disconnect(view: ViewName): void;
}
