/// <reference lib="webworker" />

import { DBSchema, openDB } from 'idb';
import {
  Subject,
  firstValueFrom,
  interval,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import { WorkerCommand } from './data-sync.service';
import type {
  ConfigIDB,
  IDB,
  PokemonIDB,
  Typ,
  TypesIDB,
  Val,
} from './worker-generics';

export type LoadResult<T extends string> = {
  ok: boolean;
  stores: T[];
  succeeded: T[];
  skipped: T[];
  failed: T[];
  messages: string[];
};

type DBInfo = {
  config: { name: string; version: number };
  types: { name: string; version: number };
  pokemon: { name: string; version: number };
};

let dbInfo: DBInfo;

addEventListener(
  'message',
  async ({ data: msg }: MessageEvent<WorkerCommand<Typ>>) => {
    try {
      switch (msg.command) {
        case 'init':
          try {
            dbInfo = await init(
              msg.args.apiUrl,
              msg.args.dbName,
              msg.args.dbVersion,
              msg.args.types
            );
            postMessage({
              status: 'OK',
              message: `Initialized IDB ${msg.args.dbName} v${msg.args.dbVersion}.`,
            });
            postMessage(dbInfo);
          } catch (error) {
            postMessage({
              status: 'ERR',
              message: 'Failed to initialize IDB',
              error,
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
          const db = await openDB<TypesIDB>(
            dbInfo.types.name,
            dbInfo.types.version
          );
          const info = await loadByType(
            db,
            msg.args.url,
            msg.args.types,
            msg.args.throttleTimeMs
          );
          postMessage(info);
          break;
        default:
          const _exhaustiveCheck: never = msg;
          return _exhaustiveCheck;
      }
    } catch (error) {
      console.error('Unhandled exception in worker.');
      console.error(error);
      postMessage(error);
    }
  }
);

async function deleteExistingObjectStores<T extends DBSchema>(db: IDB<T>) {
  const result: {
    deleted: string[];
    failed: string[];
  } = {
    deleted: [],
    failed: [],
  };

  console.debug(
    `Deleting ${db.objectStoreNames.length} old object stores from ${db.name}`
  );
  for (const store of db.objectStoreNames) {
    try {
      db.deleteObjectStore(store);
      result.deleted.push(store as string);
      console.debug(`Deleted object store ${db.name}.${store}`);
    } catch {
      console.error(`Failed to delete object store ${db.name}.${store}`);
      result.failed.push(store as string);
    }
  }

  return result;
}

async function init(
  url: string,
  dbPrefix: string,
  dbVersion: number,
  stores: Typ[]
): Promise<DBInfo> {
  // Create config DB (simple key/value pairs)
  const dbConfig = await openDB<ConfigIDB>(`${dbPrefix}-config`, dbVersion, {
    async upgrade(db) {
      deleteExistingObjectStores(db);
      const store = db.createObjectStore('config');
      await store.put(url, 'apiUrl');
    },
    async blocked(currentVersion, blockedVersion, event) {},
  });

  // Create DB w/ Pokemon grouped by type
  const dbTypes = await openDB<TypesIDB>(`${dbPrefix}-types`, dbVersion, {
    async upgrade(db, oldVersion, newVersion, tx) {
      console.log(`Upgrading ${db.name} from v${oldVersion} to v${newVersion}`);
      deleteExistingObjectStores(db);

      db.createObjectStore('metadata');

      console.debug(`Creating ${stores.length} type object stores.`);
      for (const store of stores) {
        try {
          db.createObjectStore(store);
        } catch {
          console.error(`Failed to create object store ${store}`);
        }
      }
    },
    async blocked(currentVersion, blockedVersion, event) {},
  });

  // Create DB w/ all Pokemon details in one object store.
  const dbPokemon = await openDB<PokemonIDB>(`${dbPrefix}-pokemon`, dbVersion, {
    async upgrade(db, oldVersion, newVersion, tx) {
      deleteExistingObjectStores(db);
      db.createObjectStore('pokemon');
    },
    async blocked(currentVersion, blockedVersion, event) {},
  });

  return {
    config: { name: dbConfig.name, version: dbConfig.version },
    types: { name: dbTypes.name, version: dbTypes.version },
    pokemon: { name: dbPokemon.name, version: dbPokemon.version },
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
  db: IDB<TypesIDB>,
  /**
   * API URL that provides the initial list of types.
   * e.g. https://pokeapi.co/api/v2/type/?limit=100
   */
  url: string,
  stores: Typ[],
  throttleTimeMs: number = 15 * 1000
) {
  const done$ = new Subject<void>();

  let result: LoadResult<Typ> = {
    ok: false,
    stores: [],
    succeeded: [],
    skipped: [],
    failed: [],
    messages: [],
  };

  // Get list of Pokemon of the specified type
  const types: { name: Typ; url: string }[] = [];
  try {
    console.log(`Loading types from ${url}`);
    const res = await fetch(url);
    const data: {
      count: number;
      next: unknown;
      previous: unknown;
      results: { name: Typ; url: string }[];
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
            console.log(`Skipping data load for type ${type.name}`);
            result.stores.push(type.name);
            result.skipped.push(type.name);
            return;
          }

          console.log(`Loading data for type ${type.name} from ${type.url}`);
          const res = await fetch(type.url);
          const data: { pokemon: { pokemon: Omit<Val, 'id'> }[] } =
            await res.json();
          // Messy parsing/ID mapping
          // see https://pokeapi.co/api/v2/type/2/
          const items: Val[] = data.pokemon
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
async function loadToIDB(db: IDB<TypesIDB>, type: Typ, items: Val[]) {
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
