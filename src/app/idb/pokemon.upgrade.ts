import { OpenDBCallbacks } from 'idb';
import { PokemonIDB } from './pokemon.schema';
import { deleteExistingObjectStores } from './utils/delete-object-stores';

export function getUpgradePokemon() {
  const upgradePokemon: OpenDBCallbacks<PokemonIDB>['upgrade'] = async (
    db,
    oldVersion,
    newVersion,
    tx
  ) => {
    deleteExistingObjectStores(db);
    db.createObjectStore('pokemon');
    await tx.done;
  };

  return upgradePokemon;
}
