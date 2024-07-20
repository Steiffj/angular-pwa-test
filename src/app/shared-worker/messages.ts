import { MsgStruct } from '@worker-types/message-types';
import { PokemonType } from '__typegen/types';
import { SerializedGraph } from 'graphology-types';
import { Pokemon } from 'store/pokemon';

const SHARED_WORKER_MESSAGE_TYPES = [
  'misc',
  'get-list-of-type',
  'get-graph',
] as const;
export type SharedWorkerMsgName = (typeof SHARED_WORKER_MESSAGE_TYPES)[number];

export type RegisterMsg = MsgStruct<
  'register',
  SharedWorkerMsgName[],
  SharedWorkerMsgName[]
>;
export type UnregisterMsg = MsgStruct<'unregister', null | undefined, boolean>;
export type MiscMsg = MsgStruct<
  (typeof SHARED_WORKER_MESSAGE_TYPES)[0],
  string,
  string
>;
export type GetListOfTypeMsg = MsgStruct<
  (typeof SHARED_WORKER_MESSAGE_TYPES)[1],
  PokemonType,
  Pokemon[]
>;
export type GetGraphMsg = MsgStruct<
  (typeof SHARED_WORKER_MESSAGE_TYPES)[2],
  PokemonType[],
  SerializedGraph
>;

export type SharedWorkerMsg =
  | RegisterMsg
  | UnregisterMsg
  | MiscMsg
  | GetListOfTypeMsg
  | GetGraphMsg;
