import { Injectable } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { PokemonType } from '../__typegen/types';
import { Pokemon } from '../store/pokemon';
import { MsgStruct } from '../worker-messaging/message-types';
import { TypedSharedWorker } from '../worker-messaging/typed-shared-worker';

export type UserSessionMsg =
  | MsgStruct<'misc', string, string>
  | MsgStruct<'get-list-of-type', PokemonType, Pokemon[]>;

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  #worker?: TypedSharedWorker<UserSessionMsg>;
  #incoming = new Subject<Pokemon[]>();

  async initSharedUserSession() {
    console.log('Starting shared worker');
    const worker = new SharedWorker(
      new URL('./user-session.worker', import.meta.url),
      {
        name: 'PWA Test User Session Sync',
        type: 'module',
      }
    ) as TypedSharedWorker<UserSessionMsg>;

    worker.port.onmessage = ({ data }) => {
      const type = data.type;
      switch (type) {
        case 'get-list-of-type': {
          if (data.response.status === 'OK') {
            this.#incoming.next(data.response.value);
          }
          break;
        }
        case 'misc': {
          if (data.response.status === 'OK') {
            console.log(data.response);
          }
          break;
        }
        default: {
          const _exhaustiveCheck: never = data;
          return _exhaustiveCheck;
        }
      }
      console.log('Received data from shared worker thread!!!');
    };

    worker.port.postMessage({
      type: 'misc',
      payload: 'hello from UI thread :)',
    });

    this.#worker = worker;
  }

  async getPokemonList(type: PokemonType) {
    if (!this.#worker) {
      return [];
    }

    const list = firstValueFrom(this.#incoming);
    this.#worker.port.postMessage({
      type: 'get-list-of-type',
      payload: type,
    });
    return await list;
  }
}
