import { Injectable } from '@angular/core';
import { POKEMON_TYPE, PokemonType } from '../__typegen/types';
import { TypedWebWorker } from './typed-web-worker';
import { Subject, firstValueFrom } from 'rxjs';

type WorkerInit<T> = {
  command: 'init';
  args: {
    apiUrl: string;
    dbName: string;
    dbVersion: number;
    types: T[];
  };
};
type WorkerLoadByType<T> = {
  command: 'load-by-type';
  args: {
    url: string;
    throttleTimeMs: number;
    types: T[];
  };
};
export type WorkerCommand<T extends string> =
  | WorkerInit<T>
  | WorkerLoadByType<T>;

/**
 * Features/learning TODO
 * - Learn how to use blocked/blocking events - should retry when unblocked.
 * - Add idb error handling
 */
@Injectable({
  providedIn: 'root',
})
export class DataSyncService {
  private worker:
    | TypedWebWorker<WorkerCommand<PokemonType>, unknown>
    | undefined;

  constructor() {
    // this.initWebWorker();
  }

  async requestPersistentStorage() {
    if (!navigator || !navigator.storage) {
      console.error('navigator.storage is not available in this browser.');
    }

    if (await navigator.storage.persisted()) {
      console.info('Browser already granted persistent storage :)');
      return;
    }

    await navigator.storage.persist();
    if (await navigator.storage.persisted()) {
      console.info('Browser granted persistent storage!');
    } else {
      console.error('Browser refused persistent storage :(');
    }
  }

  async initWebWorker() {
    await this.requestPersistentStorage();
    const done$ = new Subject<void>();

    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(
        new URL('./data-control.worker', import.meta.url)
      ) as TypedWebWorker<WorkerCommand<PokemonType>, unknown>;

      const listener: (typeof this.worker)['onmessage'] = ({ data }) => {
        console.log(data);
        done$.next();
      };
      this.worker.onmessage = listener;
      this.worker.postMessage({
        command: 'init',
        args: {
          apiUrl: 'https://pokeapi.co/api/v2/',
          dbName: 'poke',
          dbVersion: 1,
          types: [...POKEMON_TYPE],
        },
      });

      await firstValueFrom(done$);
      this.worker.removeEventListener('message', listener);
    } else {
      // Web Workers are not supported in this environment.
      // TODO add fallback
    }
  }

  loadPokemonByType() {
    if (!this.worker) {
      return;
    }

    const typeListUrl = new URL('type', 'https://pokeapi.co/api/v2/');
    typeListUrl.searchParams.set('limit', '100');
    this.worker.postMessage({
      command: 'load-by-type',
      args: {
        url: typeListUrl.toString(),
        throttleTimeMs: 5 * 1000,
        types: [...POKEMON_TYPE],
      },
    });
  }
}
