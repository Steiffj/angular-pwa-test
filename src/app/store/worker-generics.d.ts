import { DBSchema, IDBPDatabase } from 'idb';
import { PokemonType } from '../__typegen/types';
import { Pokemon } from './pokemon';

type Typ = PokemonType;
type Key = number;
type Val = Pokemon;

type TypesIDB = DBSchema & {
  [key in Typ]: {
    key: Key;
    value: Val;
  };
};

type ConfigIDB = DBSchema & {
  config: {
    key: string;
    value: string;
  };
};

type PokemonIDB = DBSchema & {
  pokemon: {
    key: Key;
    value: Val;
  };
};

type IDB<T extends DBSchema> = IDBPDatabase<T>;
