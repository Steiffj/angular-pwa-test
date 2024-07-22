import { PokemonType } from '__typegen/types';
import { OpenDBCallbacks } from 'idb';
import { TypesIDB } from './types.schema';
import { deleteExistingObjectStores } from './utils/delete-object-stores';

export function getUpgradeTypes(stores: PokemonType[]) {
  const upgradeTypes: OpenDBCallbacks<TypesIDB>['upgrade'] = async (
    db,
    oldVersion,
    newVersion,
    tx
  ) => {
    console.log(`Upgrading ${db.name} from v${oldVersion} to v${newVersion}`);
    await deleteExistingObjectStores(db);

    db.createObjectStore('metadata');

    console.debug(`Creating ${stores.length} type object stores.`);
    for (const store of stores) {
      try {
        db.createObjectStore(store);
      } catch {
        console.error(`Failed to create object store ${store}`);
      }
    }
    await tx.done;
  };

  return upgradeTypes;
}
