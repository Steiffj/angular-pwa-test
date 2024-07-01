/// <reference lib="DOM" />

import { openDB } from 'idb';
import { IDB, Typ, TypesIDB, Val } from '../store/worker-generics';

const rxs: MessagePort[] = []; // TODO track which data each rx is interested in.

onconnect = (e) => {
  const port = e.ports[0];
  rxs.push(port);
  console.log(port);
  console.log(`User session is tracking ${rxs.length} clients`);

  port.onmessage = async (e) => {
    const msg = e.data;

    // TODO only post data to the rx if configured to do so. Default to a warning/uninitialized message otherwise.
    for (const rx of rxs) {
      if (
        typeof e.data === 'string' &&
        e.data.toLocaleLowerCase().includes('pokemon')
      ) {
        const res = await getListOfType('fairy');
        rx.postMessage(res);
      } else {
        rx.postMessage(`Shared worker response to ${msg}`);
      }
    }
  };
};

async function getListOfType(type: Typ) {
  console.log('Reading some pokemon from IDB');
  const list: Val[] = [];
  const idb: IDB<TypesIDB> = await openDB<TypesIDB>('poke-types', 1);
  const tx = idb.transaction(type, 'readonly');

  for await (const cursor of tx.store.iterate()) {
    list.push(cursor.value);
  }

  await tx.done;
  console.log(`Loaded ${list.length} ${type} pokemon`);
  return list;
}
