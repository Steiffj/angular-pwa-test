import { DBSchema, IDBPDatabase, OpenDBCallbacks, openDB } from 'idb';
import { IdbGlobalSettings } from 'idb-global-settings';
import { getUpgradeConfig } from 'idb/config.upgrade';
import { getUpgradePokemon } from 'idb/pokemon.upgrade';
import { getUpgradeTypes } from 'idb/types.upgrade';

export type WorkerEnvironment = { apiUrl: string; mode: 'disk' | 'ram' };

export async function openIDB<T extends DBSchema>(
  name: string,
  version: number,
  env: WorkerEnvironment,
  callbacks?: OpenDBCallbacks<T>
): Promise<
  | {
      status: 'ok';
      db: IDBPDatabase<T>;
      reason?: undefined;
      error?: undefined;
    }
  | {
      status: 'idb-mode-error';
      db?: undefined;
      error?: undefined;
    }
  | {
      status: 'detect-callback-error';
      db?: undefined;
      error?: undefined;
    }
  | {
      status: 'open-db-error';
      db?: undefined;
      error?: Error;
    }
> {
  IdbGlobalSettings.mode = env.mode;
  if (!IdbGlobalSettings.ok) {
    return {
      status: 'idb-mode-error',
    };
  }

  // Identify the correct upgrade callback based on DB naming convention.
  // Could be updated to match on more sophisticated predicate functions or regexes.
  let upgrade: OpenDBCallbacks<T>['upgrade'];
  if (callbacks?.upgrade) {
    // Prefer explicit upgrade callback if provided
    upgrade = callbacks.upgrade;
  } else if (name.includes('config')) {
    upgrade = getUpgradeConfig(env) as unknown as OpenDBCallbacks<T>['upgrade'];
  } else if (name.includes('types')) {
    upgrade = (await getUpgradeTypes(
      env
    )) as unknown as OpenDBCallbacks<T>['upgrade'];
  } else if (name.includes('pokemon')) {
    upgrade = getUpgradePokemon() as unknown as OpenDBCallbacks<T>['upgrade'];
  } else {
    console.warn(`Could not infer upgrade callback for DB name ${name}`);
    return {
      status: 'detect-callback-error',
    };
  }

  // Open the IDB connection
  try {
    const db = await openDB<T>(name, version, {
      upgrade,
      blocked: callbacks?.blocked,
      blocking: callbacks?.blocking,
      terminated: callbacks?.terminated,
    });

    return {
      status: 'ok',
      db,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'open-db-error',
      error: error instanceof Error ? error : undefined,
    };
  }
}
