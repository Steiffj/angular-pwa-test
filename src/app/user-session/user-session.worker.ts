/// <reference lib="DOM" />

import { openDB } from 'idb';
import { PokemonType } from '../__typegen/types';
import { Pokemon } from '../store/pokemon';
import { IDB, TypesIDB } from '../store/worker-generics';
import {
  MsgPort,
  SharedWorkerOnconnect,
} from '../worker-messaging/typed-shared-worker';
import { UserSessionMsg } from './user-session.service';

declare let onconnect: SharedWorkerOnconnect<UserSessionMsg>;
const rxs: MsgPort<UserSessionMsg>[] = []; // TODO track which data each rx is interested in.

onconnect = (e) => {
  const port = e.ports[0];
  rxs.push(port);
  console.log(port);
  console.log(`User session is tracking ${rxs.length} clients`);

  port.onmessage = async ({ data }) => {
    const type = data.type;
    switch (type) {
      case 'get-list-of-type': {
        const res = await getListOfType(data.payload);
        // TODO get list of ports interested in the response
        for (const rx of rxs) {
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
        for (const rx of rxs) {
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
