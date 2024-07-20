import { TypedSharedWorker } from '@worker-types/typed-shared-worker';

export interface MessengerService {
  connect(worker?: SharedWorker): void;
  disconnect(): void;
}
