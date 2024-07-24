import { OpenDBCallbacks } from 'idb';
import { ConfigIDB } from './config.schema';
import { deleteExistingObjectStores } from './utils/delete-object-stores';
import { WorkerEnvironment } from './utils/open-idb';

export function getUpgradeConfig(env: WorkerEnvironment) {
  const upgradeConfig: OpenDBCallbacks<ConfigIDB>['upgrade'] = async (
    db,
    oldVersion,
    newVersion,
    tx
  ) => {
    deleteExistingObjectStores(db);
    const store = db.createObjectStore('config');
    await store.put(env.apiUrl, 'apiUrl');
    await tx.done;
  };

  return upgradeConfig;
}
