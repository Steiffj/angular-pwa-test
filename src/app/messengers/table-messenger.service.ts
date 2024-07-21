import { Injectable, signal } from '@angular/core';
import { TypedSharedWorker } from '@worker-types/typed-shared-worker';
import { PokemonType } from '__typegen/types';
import {
  GetListOfTypeMsg,
  RegisterMsg,
  UnregisterMsg,
} from 'shared-worker/messages';
import { Pokemon } from 'store/pokemon';
import { ViewName } from 'views/view-name';
import { MessengerService } from './messenger-service';

export type TableMessages = RegisterMsg | UnregisterMsg | GetListOfTypeMsg;

@Injectable()
export class TableMessengerService implements MessengerService {
  #worker!: TypedSharedWorker<TableMessages>;

  #selectedType?: PokemonType | undefined;
  get selectedType(): PokemonType | undefined {
    return this.#selectedType;
  }
  set selectedType(type: PokemonType) {
    console.debug(`Selecting type ${type}`);
    this.#selectedType = type;
    this.#worker.port.postMessage({
      name: 'get-list-of-type',
      payload: type,
    });
  }

  #list = signal<Pokemon[]>([]);
  readonly list = this.#list.asReadonly();

  disconnect(view: ViewName) {
    if (this.#worker) {
      this.#worker.port.postMessage({
        name: 'unregister',
        payload: view,
      });
    }
  }

  connect(view: ViewName) {
    console.log('Connecting to shared worker');
    const worker: TypedSharedWorker<TableMessages> = new SharedWorker(
      new URL('../workers/shared.worker', import.meta.url),
      {
        name: 'Test PWA Shared Worker',
        type: 'module',
      }
    ) as TypedSharedWorker<TableMessages>;

    worker.port.onmessage = ({ data }) => {
      const name = data.name;
      console.info(`Received ${name} response from worker`);
      switch (name) {
        case 'register': {
          if (data.response.status === 'OK') {
            console.log(
              `Registered thread to receive '${data.response.value}' messages`
            );
          }
          break;
        }
        case 'unregister': {
          if (data.response.status === 'OK') {
            console.log(`Unregister response: ${data.response.value}`);
            worker.port.close();
          }
          break;
        }
        case 'get-list-of-type': {
          console.debug(data.response);
          if (data.response.status === 'OK') {
            console.debug(
              `Received ${data.response.value.length} pokemon from worker`
            );
            this.#list.set(data.response.value);
          }
          break;
        }
        default: {
          const _exhaustiveCheck: never = data;
          return _exhaustiveCheck;
        }
      }
    };

    worker.port.postMessage({
      name: 'register',
      payload: {
        view,
        messages: ['get-list-of-type'],
      },
    });

    this.#worker = worker;
  }
}
