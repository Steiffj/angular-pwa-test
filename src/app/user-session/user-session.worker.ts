/// <reference lib="DOM" />

import { openDB } from 'idb';
import { PokemonType } from '../__typegen/types';
import { Pokemon } from '../store/pokemon';
import { IDB, TypesIDB } from '../store/worker-generics';
import {
  MsgPort,
  SharedWorkerOnconnect,
} from '../worker-messaging/typed-shared-worker';
import { UserSessionMsg, UserSessionMsgType } from './user-session.service';

declare let onconnect: SharedWorkerOnconnect<UserSessionMsg>;

// Track which data each rx is interested in.
const rxs = new Map<UserSessionMsgType, MsgPort<UserSessionMsg>[]>();
function setPort(port: MsgPort<UserSessionMsg>, types: UserSessionMsgType[]) {
  const registered: UserSessionMsgType[] = [];
  for (const type of types) {
    const ports = rxs.get(type) ?? [];
    if (!ports.includes(port)) {
      rxs.set(type, [port, ...ports]);
      registered.push(type);
    }
  }
  return registered;
}
function getPorts(type: UserSessionMsgType) {
  return rxs.get(type) ?? [];
}

onconnect = (e) => {
  const port = e.ports[0];

  port.onmessage = async ({ data }) => {
    const type = data.type;
    switch (type) {
      case 'register': {
        const registered = setPort(port, data.payload);
        port.postMessage({
          type,
          response: {
            status: 'OK',
            value: registered,
          },
        });
        break;
      }
      case 'get-list-of-type': {
        const res = await getListOfType(data.payload);
        // TODO get list of ports interested in the response
        for (const rx of getPorts(type)) {
          rx.postMessage({
            type,
            response: {
              status: 'OK',
              value: res,
            },
          });
        }
        break;
      }
      case 'misc': {
        for (const rx of getPorts(type)) {
          rx.postMessage({
            type,
            response: {
              status: 'OK',
              value: `Shared worker response to ${data.payload}`,
            },
          });
        }
        break;
      }
      default: {
        const _exhaustiveCheck: never = data;
        return _exhaustiveCheck;
      }
    }
  };
};

async function getListOfType(type: PokemonType) {
  console.log('Reading some pokemon from IDB');
  const list: Pokemon[] = [];
  const idb: IDB<TypesIDB> = await openDB<TypesIDB>('poke-types', 1);
  const tx = idb.transaction(type, 'readonly');

  for await (const cursor of tx.store.iterate()) {
    list.push(cursor.value);
  }

  await tx.done;
  console.log(`Loaded ${list.length} ${type} pokemon`);
  return list;
}
