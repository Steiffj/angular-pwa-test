/// <reference lib="webworker" />

import { WorkerOnmessage, WorkerPostMessage } from '@worker-types/typed-worker';
import { IDBPDatabase } from 'idb';
import { ConfigIDB } from 'idb/config.schema';
import { PokemonIDB } from 'idb/pokemon.schema';
import { TypesIDB } from 'idb/types.schema';
import { WorkerEnvironment, openIDB } from 'idb/utils/open-idb';
import {
  Subject,
  firstValueFrom,
  interval,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import { PokemonType } from '../__typegen/types';
import { DataSyncMsg } from './messages';
import { Pokemon } from './pokemon';

export type LoadResult<T extends string> = {
  ok: boolean;
  stores: T[];
  succeeded: T[];
  skipped: T[];
  failed: T[];
  messages: string[];
};

export type DBInfo = {
  config: { name: string; version: number };
  types: { name: string; version: number };
  pokemon: { name: string; version: number };
};

let dbInfo: DBInfo;
let env: WorkerEnvironment;
const IDB_MODE = 'disk';

declare let onmessage: WorkerOnmessage<DataSyncMsg<PokemonType>>;
declare const postMessage: WorkerPostMessage<DataSyncMsg<PokemonType>>;
onmessage = async ({ data: msg }) => {
  try {
    switch (msg.name) {
      case 'init':
        try {
          env = {
            apiUrl: msg.payload.apiUrl,
            mode: IDB_MODE,
          };

          console.log('Initializing DB info.');
          dbInfo = await init(
            msg.payload.apiUrl,
            msg.payload.dbName,
            msg.payload.dbVersion,
            msg.payload.types
          );
          console.log('Successfully initialized DB info.');
          postMessage({
            name: msg.name,
            response: {
              status: 'OK',
              value: dbInfo,
            },
          });
        } catch (error) {
          postMessage({
            name: msg.name,
            response: {
              status: 'ERROR',
              errors: ['Failed to initialize IDB'],
            },
          });
        }
        break;
      case 'load-by-type':
        if (!dbInfo) {
          console.warn('DB info is not initialized. Not loading data');
          return;
        } else {
          console.log('Starting load by type');
        }
        const { status, db, error } = await openIDB<TypesIDB>(
          dbInfo.types.name,
          dbInfo.types.version,
          env
        );

        if (status !== 'ok') {
          console.error(error);
          return;
        }

        const info = await loadByType(
          db,
          msg.payload.url,
          msg.payload.types,
          msg.payload.throttleTimeMs
        );
        postMessage({
          name: msg.name,
          response: {
            status: 'OK',
            value: info,
          },
        });
        break;
      default:
        const _exhaustiveCheck: never = msg;
        return _exhaustiveCheck;
    }
  } catch (error) {
    console.error('Unhandled exception in worker.');
    console.error(error);
  }
};

async function init(
  url: string,
  dbPrefix: string,
  dbVersion: number,
  stores: PokemonType[]
): Promise<DBInfo> {
  // Create config DB (simple key/value pairs)
  const dbConfig = await openIDB<ConfigIDB>(`${dbPrefix}-config`, dbVersion, {
    apiUrl: url,
    mode: IDB_MODE,
  });

  if (dbConfig.status !== 'ok') {
    throw new AggregateError(
      [dbConfig.error],
      'Failed to initialize IndexedDB DB.'
    );
  }

  // Create DB w/ Pokemon grouped by type
  const dbTypes = await openIDB<TypesIDB>(`${dbPrefix}-types`, dbVersion, {
    apiUrl: url,
    mode: IDB_MODE,
  });

  if (dbTypes.status !== 'ok') {
    throw new AggregateError(
      [dbTypes.error],
      'Failed to initialize IndexedDB DB.'
    );
  }

  // Create DB w/ all Pokemon details in one object store.
  const dbPokemon = await openIDB<PokemonIDB>(
    `${dbPrefix}-pokemon`,
    dbVersion,
    { apiUrl: url, mode: IDB_MODE }
  );

  if (dbPokemon.status !== 'ok') {
    throw new AggregateError(
      [dbPokemon.error],
      'Failed to initialize IndexedDB DB.'
    );
  }

  return {
    config: { name: dbConfig.db.name, version: dbConfig.db.version },
    types: { name: dbTypes.db.name, version: dbTypes.db.version },
    pokemon: { name: dbPokemon.db.name, version: dbPokemon.db.version },
  };
}

/**
 * Load all Pokemon to IDB, grouped by type.
 *
 * Pokemon with multiple types will appear in each respective type object store. These Pokemon objects do not contain full details.
 * @param db
 * @param url
 * @param stores
 * @param throttleTimeMs
 * @returns
 */
async function loadByType(
  db: IDBPDatabase<TypesIDB>,
  /**
   * API URL that provides the initial list of types.
   * e.g. https://pokeapi.co/api/v2/type/?limit=100
   */
  url: string,
  stores: PokemonType[],
  throttleTimeMs: number = 15 * 1000
) {
  const done$ = new Subject<void>();

  let result: LoadResult<PokemonType> = {
    ok: false,
    stores: [],
    succeeded: [],
    skipped: [],
    failed: [],
    messages: [],
  };

  // Get list of Pokemon of the specified type
  const types: { name: PokemonType; url: string }[] = [];
  try {
    console.log(`Loading types from ${url}`);
    const res = await fetch(url);
    const data: {
      count: number;
      next: unknown;
      previous: unknown;
      results: { name: PokemonType; url: string }[];
    } = await res.json();
    if (data.count !== stores.length) {
      console.warn(
        `Number of stores provided (${stores.length}) does not match API results (${data.count})`
      );
    }
    if (data.next || data.previous) {
      console.warn(
        'Not all types were loaded. Increase the "limit" query param'
      );
    }
    console.debug(`Loaded ${data.results.length} types`);
    types.push(...data.results);
  } catch (error) {
    result.messages.push(
      'Failed to load list of stores. Data will not be loaded'
    );
    done$.next();
  }

  // Load each list of Pokemon by type (with a delay in between each API call)
  console.log('Starting background load by type...');
  interval(throttleTimeMs)
    .pipe(
      takeUntil(done$),
      startWith(0),
      tap(async () => {
        // Check if all data has been loaded
        const type = types.pop();
        if (!type) {
          done$.next();
          return;
        }

        // Load list of Pokemon of a given type
        try {
          // Check if we really need to load this data
          const tx = db.transaction('metadata', 'readonly');
          const metadata = await tx.store.get(type.name);
          let load = false;
          if (metadata && metadata.count > 0) {
            const staleMs = 24 * 60 * 60 * 1000; // 24 hours
            const now = new Date();
            const diffMs = Math.abs(
              now.getTime() - metadata.timestamp.getTime()
            );
            if (diffMs >= staleMs) {
              load = true;
            }
          } else {
            load = true;
          }
          await tx.done;

          // Only load if the data is old or the store is empty
          if (!load) {
            result.stores.push(type.name);
            result.skipped.push(type.name);
            return;
          }

          console.log(`Loading data for type ${type.name} from ${type.url}`);
          const res = await fetch(type.url);
          const data: { pokemon: { pokemon: Omit<Pokemon, 'id'> }[] } =
            await res.json();
          // Messy parsing/ID mapping
          // see https://pokeapi.co/api/v2/type/2/
          const items: Pokemon[] = data.pokemon
            .map((p) => ({
              ...p.pokemon,
              id: +(
                new URL(p.pokemon.url).pathname
                  .split('/')
                  .filter((path) => !!path)
                  .at(-1) ?? -1
              ),
            }))
            .filter((p) => p.id > 0);

          result.stores.push(type.name);
          const errors = await loadToIDB(db, type.name, items);
          if (errors.length > 0) {
            result.failed.push(type.name);
            result.messages.push(...errors);
          } else {
            result.succeeded.push(type.name);
          }
        } catch (error) {
          result.failed.push(type.name);
        }
      })
    )
    .subscribe({
      error: () => {
        done$.next();
      },
      complete: () => {
        console.log('Finished loading');
      },
    });

  console.debug('Waiting for load done indicator');
  await firstValueFrom(done$);
  console.debug('Load by type marked done');
  if (result.failed.length === 0) {
    result.ok = true;
  }
  return result;
}

/**
 * Load of list of Pokemon of a single type to IDB.
 * @param db
 * @param type
 * @param items
 * @returns
 */
async function loadToIDB(
  db: IDBPDatabase<TypesIDB>,
  type: PokemonType,
  items: Pokemon[]
) {
  const tx = db.transaction([type, 'metadata'], 'readwrite');

  // Update metadata
  console.debug(`Updating ${type} metadata`);
  const metaStore = tx.objectStore('metadata');
  await metaStore.put({ count: items.length, timestamp: new Date() }, type);

  // Update list
  console.debug(`Updating ${type} data`);
  const results = await Promise.allSettled([
    items.map((item) => {
      tx.objectStore(type).put(item, item.id);
    }),
    tx.done,
  ]);

  const errorMessages: string[] = [];
  for (const res of results) {
    if (res.status === 'rejected') {
      errorMessages.push(res.reason);
    }
  }

  return errorMessages;
}
