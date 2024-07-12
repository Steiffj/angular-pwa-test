import {
  indexedDB as fakeIndexedDB,
  IDBCursor as FDBCursor,
  IDBCursorWithValue as FDBCursorWithValue,
  IDBDatabase as FDBDatabase,
  IDBFactory as FDBFactory,
  IDBIndex as FDBIndex,
  IDBKeyRange as FDBKeyRange,
  IDBObjectStore as FDBObjectStore,
  IDBOpenDBRequest as FDBOpenDBRequest,
  IDBRequest as FDBRequest,
  IDBTransaction as FDBTransaction,
  IDBVersionChangeEvent as FDBVersionChangeEvent,
} from 'fake-indexeddb';
import { objectKeys } from './object-keys';

/**
 * Settings to switch between persistent (default) and in-memory IndexedDB implementations.
 */
export class IdbGlobalSettings {
  static #ok = true;
  static get ok() {
    return this.#ok && this.mode !== 'invalid';
  }

  private static readonly fake = {
    indexedDB: fakeIndexedDB,
    IDBCursor: FDBCursor,
    IDBCursorWithValue: FDBCursorWithValue,
    IDBDatabase: FDBDatabase,
    IDBFactory: FDBFactory,
    IDBIndex: FDBIndex,
    IDBKeyRange: FDBKeyRange,
    IDBObjectStore: FDBObjectStore,
    IDBOpenDBRequest: FDBOpenDBRequest,
    IDBRequest: FDBRequest,
    IDBTransaction: FDBTransaction,
    IDBVersionChangeEvent: FDBVersionChangeEvent,
  } as const;
  private static readonly real = {
    indexedDB: globalThis.indexedDB,
    IDBCursor: globalThis.IDBCursor,
    IDBCursorWithValue: globalThis.IDBCursorWithValue,
    IDBDatabase: globalThis.IDBDatabase,
    IDBFactory: globalThis.IDBFactory,
    IDBIndex: globalThis.IDBIndex,
    IDBKeyRange: globalThis.IDBKeyRange,
    IDBObjectStore: globalThis.IDBObjectStore,
    IDBOpenDBRequest: globalThis.IDBOpenDBRequest,
    IDBRequest: globalThis.IDBRequest,
    IDBTransaction: globalThis.IDBTransaction,
    IDBVersionChangeEvent: globalThis.IDBVersionChangeEvent,
  } as const;

  static set mode(mode: 'persistent' | 'in-memory') {
    switch (mode) {
      case 'in-memory': {
        this.setMode('in-memory', this.fake);
        break;
      }
      case 'persistent': {
        this.setMode('persistent', this.real);
        break;
      }
      default: {
        const _exhaustiveCheck: never = mode;
      }
    }
  }

  static get mode(): 'persistent' | 'in-memory' | 'invalid' {
    if (this.isMode('persistent')) {
      return 'persistent';
    } else if (this.isMode('in-memory')) {
      return 'in-memory';
    } else {
      return 'invalid';
    }
  }

  private static setMode(
    mode: 'persistent' | 'in-memory',
    globals: typeof IdbGlobalSettings.real
  ) {
    try {
      for (const key of objectKeys(globals)) {
        Object.defineProperty(globalThis, key, {
          value: globals[key],
          writable: true,
          configurable: true,
        });
      }
    } catch (error) {
      console.error(`Failed to set IDB mode to ${mode}`);
      console.error(error);
      this.#ok = false;
    }

    console.info(`Successfully set IDB mode to ${mode}`);
    this.#ok = true;
  }

  private static isMode(mode: 'persistent' | 'in-memory') {
    const globals = mode === 'persistent' ? this.real : this.fake;
    for (const key of objectKeys(globals)) {
      if (globalThis[key] !== globals[key]) {
        return false;
      }
    }

    return true;
  }
}
