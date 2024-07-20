import { Injectable, signal } from '@angular/core';
import { TypedSharedWorker } from '@worker-types/typed-shared-worker';
import { PokemonType } from '__typegen/types';
import Graph from 'graphology';
import {
  GetGraphMsg,
  RegisterMsg,
  UnregisterMsg,
} from 'shared-worker/messages';
import { MessengerService } from './messenger-service';

export type VisualizationMessages = RegisterMsg | UnregisterMsg | GetGraphMsg;

@Injectable({
  providedIn: 'root',
})
export class VisualizationMessengerService implements MessengerService {
  #worker?: TypedSharedWorker<VisualizationMessages>;
  #graph = signal<Graph>(new Graph());

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
    const worker = !!sharedWorker
      ? (sharedWorker as TypedSharedWorker<VisualizationMessages>)
      : (new SharedWorker(
          new URL('../workers/shared.worker', import.meta.url),
          {
            name: 'Test PWA Shared Worker',
            type: 'module',
          }
        ) as TypedSharedWorker<VisualizationMessages>);

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

    this.#worker = worker;
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
