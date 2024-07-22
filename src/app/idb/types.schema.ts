import { PokemonType } from '__typegen/types';
import { DBSchema } from 'idb';
import { Pokemon } from 'store/pokemon';

export type TypesIDB = DBSchema & {
  [key in PokemonType]: {
    key: number;
    value: Pokemon;
  };
} & {
  metadata: {
    key: PokemonType;
    value: {
      count: number;
      timestamp: Date;
    };
  };
};
