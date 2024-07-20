import { Injectable } from '@angular/core';
import { TypedSharedWorker } from '@worker-types/typed-shared-worker';
import { PokemonType } from '__typegen/types';
import { Subject, firstValueFrom } from 'rxjs';
import {
  GetListOfTypeMsg,
  RegisterMsg,
  UnregisterMsg,
} from 'shared-worker/messages';
import { Pokemon } from 'store/pokemon';
import { MessengerService } from './messenger-service';

export type TableMessages = RegisterMsg | UnregisterMsg | GetListOfTypeMsg;

@Injectable()
export class TableMessengerService implements MessengerService {
  #worker?: TypedSharedWorker<TableMessages>;
  #incoming = new Subject<Pokemon[]>();

  disconnect() {
    if (this.#worker) {
      this.#worker.port.postMessage({
        name: 'unregister',
        payload: undefined,
      });
    }
  }

  connect(sharedWorker?: SharedWorker) {
    console.log('Connecting to shared worker');
    const worker: TypedSharedWorker<TableMessages> = !!sharedWorker
      ? (sharedWorker as TypedSharedWorker<TableMessages>)
      : (new SharedWorker(new URL('./shared.worker', import.meta.url), {
          name: 'Test PWA Shared Worker',
          type: 'module',
        }) as TypedSharedWorker<TableMessages>);

    worker.port.onmessage = ({ data }) => {
      const name = data.name;
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
          if (data.response.status === 'OK') {
            this.#incoming.next(data.response.value);
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
      payload: ['get-graph'],
    });

    this.#worker = worker;
  }

  async getPokemonList(type: PokemonType) {
    if (!this.#worker) {
      return [];
    }

    const list = firstValueFrom(this.#incoming);
    this.#worker.port.postMessage({
      name: 'get-list-of-type',
      payload: type,
    });
    return await list;
  }
}
