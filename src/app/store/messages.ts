import { MsgStruct } from '@worker-types/message-types';
import { DBInfo, LoadResult } from './data-control.worker';

export type InitMsg<T extends string> = MsgStruct<
  'init',
  {
    apiUrl: string;
    dbName: string;
    dbVersion: number;
    types: T[];
  },
  DBInfo
>;
export type LoadByTypeMsg<T extends string> = MsgStruct<
  'load-by-type',
  {
    url: string;
    throttleTimeMs: number;
    types: T[];
  },
  LoadResult<T>
>;

export type DataSyncMsg<T extends string> = InitMsg<T> | LoadByTypeMsg<T>;
