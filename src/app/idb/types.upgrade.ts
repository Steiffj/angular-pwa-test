import { OpenDBCallbacks } from 'idb';
import { fetchPokemonTypes } from 'store/fetch-pokemon-types';
import { TypesIDB } from './types.schema';
import { deleteExistingObjectStores } from './utils/delete-object-stores';
import { WorkerEnvironment } from './utils/open-idb';

export async function getUpgradeTypes(env: WorkerEnvironment) {
  const stores = await fetchPokemonTypes(env.apiUrl);

  const upgradeTypes: OpenDBCallbacks<TypesIDB>['upgrade'] = async (
    db,
    oldVersion,
    newVersion,
    tx
  ) => {
    console.log(`Upgrading ${db.name} from v${oldVersion} to v${newVersion}`);
    deleteExistingObjectStores(db);

    db.createObjectStore('metadata');

    console.debug(`Creating ${stores.length} type object stores.`);
    for (const store of stores) {
      db.createObjectStore(store.name);
    }

    await tx.done;
  };

  return upgradeTypes;
}
