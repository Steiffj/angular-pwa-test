import { OpenDBCallbacks } from 'idb';
import { PokemonIDB } from './pokemon.schema';
import { deleteExistingObjectStores } from './utils/delete-object-stores';

export function getUpgradePokemon() {
  const upgradePokemon: OpenDBCallbacks<PokemonIDB>['upgrade'] = async (db) => {
    await deleteExistingObjectStores(db);
    db.createObjectStore('pokemon');
  };

  return upgradePokemon;
}
