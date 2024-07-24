import { DBSchema, IDBPDatabase } from 'idb';

export function deleteExistingObjectStores<T extends DBSchema>(
  db: IDBPDatabase<T>
) {
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
