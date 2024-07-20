import { Injectable, signal } from '@angular/core';
import { SHARED_WORKER_NAME } from '@worker-config/constants';
import { TypedSharedWorker } from '@worker-types/typed-shared-worker';
import Graph from 'graphology';
import { Subject, firstValueFrom } from 'rxjs';
import { PokemonType } from '../__typegen/types';
import { Pokemon } from '../store/pokemon';
import { SharedWorkerMsg } from './messages';

@Injectable({
  providedIn: 'root',
})
export class SharedWorkerService {
  #worker?: TypedSharedWorker<SharedWorkerMsg>;
  #incoming = new Subject<Pokemon[]>();
  #graph = signal<Graph>(new Graph());

  initSharedUserSession() {
    console.log('Starting shared worker');
    const worker = new SharedWorker(
      new URL('./shared.worker', import.meta.url),
      {
        name: 'Test PWA Shared Worker',
        type: 'module',
      }
    ) as TypedSharedWorker<SharedWorkerMsg>;

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
        case 'get-list-of-type': {
          if (data.response.status === 'OK') {
            this.#incoming.next(data.response.value);
          }
          break;
        }
        case 'misc': {
          if (data.response.status === 'OK') {
            console.log(data.response.value);
          }
          break;
        }
        case 'get-graph': {
          if (data.response.status === 'OK') {
            this.#graph.set(Graph.from(data.response.value));
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
      payload: ['get-list-of-type', 'get-graph'],
    });

    worker.port.postMessage({
      name: 'misc',
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
      name: 'get-list-of-type',
      payload: type,
    });
    return await list;
  }

  generateGraph(types: PokemonType[]) {
    if (!this.#worker) {
      return;
    }

    this.#worker.port.postMessage({
      name: 'get-graph',
      payload: types,
    });
  }

  get graph() {
    return this.#graph.asReadonly();
  }
}
