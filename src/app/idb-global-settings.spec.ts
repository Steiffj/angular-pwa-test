import { openDB } from 'idb';
import { IdbGlobalSettings } from './idb-global-settings';

fdescribe('IdbToggle', () => {
  afterEach(() => {
    IdbGlobalSettings.mode = 'disk';
  });

  it('globalThis should have the real indexedDB implementation by default', () => {
    expect(IdbGlobalSettings.mode).toEqual('disk');
    expect(IdbGlobalSettings.ok).toBeTrue();
  });

  it('should change globalThis to fake indexedDB implementation when setting mode to in-memory', () => {
    IdbGlobalSettings.mode = 'ram';
    expect(IdbGlobalSettings.mode).toEqual('ram');
    expect(IdbGlobalSettings.ok).toBeTrue();
  });

  it('should change globalThis to real indexedDB implementation when setting mode to persistent', () => {
    IdbGlobalSettings.mode = 'ram';
    IdbGlobalSettings.mode = 'disk';
    expect(IdbGlobalSettings.mode).toEqual('disk');
    expect(IdbGlobalSettings.ok).toBeTrue();
  });

  it('should report invalid when globalThis contains unexpected properties', () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: 'nonsense',
    });
    expect(IdbGlobalSettings.mode).toEqual('invalid');
    expect(IdbGlobalSettings.ok).toBeFalse();
  });

  it('should restore globalThis to valid state when setting mode', () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: 'nonsense',
    });
    expect(IdbGlobalSettings.mode).toEqual('invalid');
    expect(IdbGlobalSettings.ok).toBeFalse();

    IdbGlobalSettings.mode = 'disk';
    expect(IdbGlobalSettings.mode).toEqual('disk');
    expect(IdbGlobalSettings.ok).toBeTrue();

    Object.defineProperty(globalThis, 'indexedDB', {
      value: 'nonsense',
    });
    expect(IdbGlobalSettings.mode).toEqual('invalid');
    expect(IdbGlobalSettings.ok).toBeFalse();

    IdbGlobalSettings.mode = 'ram';
    expect(IdbGlobalSettings.mode).toEqual('ram');
    expect(IdbGlobalSettings.ok).toBeTrue();
  });

  describe('idb library compatibility', () => {
    beforeEach(() => {
      IdbGlobalSettings.mode = 'ram';
    });

    afterEach(() => {
      IdbGlobalSettings.mode = 'disk';
    });

    it('should create an in-memory database on upgrade', async () => {
      const db = await openDB('test', 1, {
        upgrade: (db) => {
          db.createObjectStore('test-obj-store');
        },
      });

      expect(db.objectStoreNames).toContain('test-obj-store');
      db.close();
    });

    it('should not create a persistent object store when mode is set to in-memory', async () => {
      const db = await openDB('test', 1, {
        upgrade: (db) => {
          db.createObjectStore('test-obj-store');
        },
      });

      expect(db.objectStoreNames)
        .withContext('in-memory IDB has been initialized')
        .toContain('test-obj-store');
      db.close();

      IdbGlobalSettings.mode = 'disk';
      const realDB = await openDB('test', 1);
      expect(realDB.objectStoreNames.length)
        .withContext('persistent IDB has not been initialized')
        .toEqual(0);
    });
  });
});
