import { DBSchema } from 'idb';
import { Pokemon } from 'store/pokemon';

export type PokemonIDB = DBSchema & {
  pokemon: {
    key: number;
    value: Pokemon;
  };
};
