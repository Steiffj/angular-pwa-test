import { MsgStruct } from '@worker-types/message-types';
import { PokemonType } from '__typegen/types';
import { SerializedGraph } from 'graphology-types';
import { Pokemon } from 'store/pokemon';
import { ViewName } from 'views/view-name';

const SHARED_WORKER_MESSAGE_NAMES = [
  'register',
  'unregister',
  'misc',
  'get-list-of-type',
  'get-graph',
] as const;
export type SharedWorkerMsgName = (typeof SHARED_WORKER_MESSAGE_NAMES)[number];

export type RegisterMsg = MsgStruct<
  (typeof SHARED_WORKER_MESSAGE_NAMES)[0],
  { view: ViewName; messages: SharedWorkerMsgName[] },
  SharedWorkerMsgName[]
>;
export type UnregisterMsg = MsgStruct<
  (typeof SHARED_WORKER_MESSAGE_NAMES)[1],
  ViewName,
  boolean
>;
export type MiscMsg = MsgStruct<
  (typeof SHARED_WORKER_MESSAGE_NAMES)[2],
  string,
  string
>;
export type GetListOfTypeMsg = MsgStruct<
  (typeof SHARED_WORKER_MESSAGE_NAMES)[3],
  PokemonType,
  Pokemon[]
>;
export type GetGraphMsg = MsgStruct<
  (typeof SHARED_WORKER_MESSAGE_NAMES)[4],
  PokemonType[],
  SerializedGraph
>;

export type SharedWorkerMsg =
  | RegisterMsg
  | UnregisterMsg
  | MiscMsg
  | GetListOfTypeMsg
  | GetGraphMsg;
