import { OpenDBCallbacks } from 'idb';
import { ConfigIDB } from './config.schema';
import { deleteExistingObjectStores } from './utils/delete-object-stores';

export function getUpgradeConfig(url: string) {
  const upgradeConfig: OpenDBCallbacks<ConfigIDB>['upgrade'] = async (
    db,
    oldVersion,
    newVersion,
    tx
  ) => {
    await deleteExistingObjectStores(db);
    const store = db.createObjectStore('config');
    await store.put(url, 'apiUrl');
    await tx.done;
  };

  return upgradeConfig;
}
