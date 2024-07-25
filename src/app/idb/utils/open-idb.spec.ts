import { POKEMON_TYPE } from '__typegen/types';
import { ConfigIDB } from 'idb/config.schema';
import { PokemonIDB } from 'idb/pokemon.schema';
import { TypesIDB } from 'idb/types.schema';
import { WorkerEnvironment, openIDB } from './open-idb';

fdescribe('openIDB', () => {
  const version = 1;
  const env: WorkerEnvironment = {
    apiUrl: 'https://test.url',
    mode: 'ram',
  };

  for (const name of ['poke-types', 'types', 'test-types-test']) {
    it(`should use the types upgrade callback for database name '${name}'`, async () => {
      const typesRes = new Response(
        JSON.stringify({
          count: POKEMON_TYPE.length,
          next: undefined,
          previous: undefined,
          results: POKEMON_TYPE.map((type) => ({ name: type, url: '' })),
        })
      );
      spyOn(globalThis, 'fetch').and.resolveTo(typesRes);

      const { status, db, error } = await openIDB<TypesIDB>(name, version, env);

      if (status !== 'ok') {
        fail(`Test connection unexpectedly failed. Error: ` + error);
        return;
      }

      expect(db.objectStoreNames.length).toBeGreaterThanOrEqual(
        POKEMON_TYPE.length
      );
    });
  }

  for (const name of ['poke-config', 'config', 'test-config-test']) {
    it(`should use the config upgrade callback for database name '${name}'`, async () => {
      const { status, db, error } = await openIDB<ConfigIDB>(
        name,
        version,
        env
      );

      if (status !== 'ok') {
        fail(`Test connection unexpectedly failed. Error: ` + error);
        return;
      }

      expect(db.objectStoreNames).toContain('config');
      const url = await db.get('config', 'apiUrl');
      expect(url).toEqual(env.apiUrl);
    });
  }

  for (const name of ['poke-pokemon', 'pokemon', 'test-pokemon-test']) {
    it(`should use the pokemon upgrade callback for database name '${name}'`, async () => {
      const { status, db, error } = await openIDB<PokemonIDB>(
        name,
        version,
        env
      );

      if (status !== 'ok') {
        fail(`Test connection unexpectedly failed. Error: ` + error);
        return;
      }

      expect(db.objectStoreNames).toContain('pokemon');
    });
  }

  it('should fail to open DB connection when provided an unfamiliar database name', async () => {
    const { status, db } = await openIDB<PokemonIDB>(
      'unsupported-name',
      version,
      env
    );

    expect(status).toEqual('detect-callback-error');
    expect(db).toBeFalsy();
  });

  it('should allow unfamiliar database names when provided an upgrade callback', async () => {
    const customKey = 'key';
    const customUrl = 'custom/test/url';
    const { status, db, error } = await openIDB<ConfigIDB>(
      'unsupported-name',
      version,
      env,
      {
        upgrade: async (db, oldVersion, newVersion, tx) => {
          const store = db.createObjectStore('config');
          await store.put(customUrl, customKey);
          await tx.done;
        },
      }
    );

    if (status !== 'ok') {
      fail(`Test connection unexpectedly failed. Error: ` + error);
      return;
    }

    expect(status).toEqual('ok');
    expect(db.objectStoreNames).toContain('config');
    const url = await db.get('config', customKey);
    expect(url).toEqual(customUrl);
  });
});
