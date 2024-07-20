import { ViewName } from 'views/view-name';

export interface MessengerService {
  connect(view: ViewName, worker?: SharedWorker): void;
  disconnect(view: ViewName): void;
}
