import { DBSchema } from 'idb';

export type ConfigIDB = DBSchema & {
  config: {
    key: string;
    value: string;
  };
};
