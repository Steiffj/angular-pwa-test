import { Injectable } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { POKEMON_TYPE, PokemonType } from '../__typegen/types';
import { MsgStruct } from '../worker-types/message-types';
import { TypedWorker } from '../worker-types/typed-worker';
import { DBInfo, LoadResult } from './data-control.worker';

export type DataSyncMsg<T extends string> =
  | MsgStruct<
      'init',
      {
        apiUrl: string;
        dbName: string;
        dbVersion: number;
        types: T[];
      },
      DBInfo
    >
  | MsgStruct<
      'load-by-type',
      {
        url: string;
        throttleTimeMs: number;
        types: T[];
      },
      LoadResult<T>
    >;

/**
 * Features/learning TODO
 * - Learn how to use blocked/blocking events - should retry when unblocked.
 * - Add idb error handling
 */
@Injectable({
  providedIn: 'root',
})
export class DataSyncService {
  private worker: TypedWorker<DataSyncMsg<PokemonType>> | undefined;

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

    try {
      this.worker = new Worker(
        new URL('./data-control.worker', import.meta.url)
      ) as TypedWorker<DataSyncMsg<PokemonType>>;
      console.log(import.meta.url);
    } catch {
      console.error('Web workers not available');
      return;
    }

    const listener: (typeof this.worker)['onmessage'] = ({ data }) => {
      console.log(data);
      done$.next();
    };
    this.worker.onmessage = listener;
    this.worker.postMessage({
      type: 'init',
      payload: {
        apiUrl: 'https://pokeapi.co/api/v2/',
        dbName: 'poke',
        dbVersion: 1,
        types: [...POKEMON_TYPE],
      },
    });

    await firstValueFrom(done$);
    this.worker.removeEventListener('message', listener);
  }

  loadPokemonByType() {
    if (!this.worker) {
      return;
    }

    const typeListUrl = new URL('type', 'https://pokeapi.co/api/v2/');
    typeListUrl.searchParams.set('limit', '100');
    this.worker.postMessage({
      type: 'load-by-type',
      payload: {
        url: typeListUrl.toString(),
        throttleTimeMs: 5 * 1000,
        types: [...POKEMON_TYPE],
      },
    });
  }
}
