/// <reference lib="DOM" />

import Graph from 'graphology';
import { circular } from 'graphology-layout';
import { TypesIDB } from 'idb/types.schema';
import { WorkerEnvironment, openIDB } from 'idb/utils/open-idb';
import { ViewName } from 'views/view-name';
import { PokemonType } from '../__typegen/types';
import {
  GetListOfTypeMsg,
  SharedWorkerMsg,
  SharedWorkerMsgName,
} from '../shared-worker/messages';
import { Pokemon } from '../store/pokemon';
import { SharedWorkerOnconnect } from '../worker-types/typed-shared-worker';
import { Multicaster } from './multicaster';

export class SharedWorkerHandler {
  // Track which data each rx is interested in.
  readonly multicaster = new Multicaster<
    SharedWorkerMsgName,
    SharedWorkerMsg
  >();
  readonly connectedViews = new Map<ViewName, number>();

  #graph: Graph = new Graph();

  constructor(public env: WorkerEnvironment) {}

  readonly onconnect: SharedWorkerOnconnect<SharedWorkerMsg> = (e) => {
    const port = e.ports[0];

    port.onmessage = async ({ data }) => {
      const name = data.name;
      switch (name) {
        case 'register': {
          const existingViewCount =
            this.connectedViews.get(data.payload.view) ?? 0;
          this.connectedViews.set(data.payload.view, existingViewCount + 1);
          const registered = this.multicaster.setPort(
            port,
            data.payload.messages
          );
          port.postMessage({
            name,
            response: {
              status: 'OK',
              value: registered,
            },
          });
          console.log(`Registered port for view '${data.payload.view}'`);
          break;
        }
        case 'unregister': {
          const viewCount = this.connectedViews.get(data.payload) ?? 1;
          this.connectedViews.set(data.payload, viewCount - 1);
          this.multicaster.clearPort(port);
          const updatedCount = this.connectedViews.get(data.payload);
          console.log(
            `Unregistered port for view '${data.payload}'. Connected '${data.payload}'s remaining: ${updatedCount}`
          );
          break;
        }
        case 'get-list-of-type': {
          postSelectedList(data.payload, this.multicaster, this.env);
          break;
        }
        case 'misc': {
          for (const rx of this.multicaster.getPorts(name)) {
            rx.postMessage({
              name,
              response: {
                status: 'OK',
                value: `Shared worker response to ${data.payload}`,
              },
            });
          }
          break;
        }
        case 'get-graph': {
          this.#graph = await getPokemonTypeGraph(data.payload, this.env);
          const serialized = this.#graph.export();
          for (const rx of this.multicaster.getPorts(name)) {
            rx.postMessage({
              name,
              response: {
                status: 'OK',
                value: serialized,
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
}

async function getPokemonTypeGraph(
  types: PokemonType[],
  env: WorkerEnvironment
) {
  console.log('Creating graph from pokemon types');
  const { status, db } = await openIDB<TypesIDB>('poke-types', 1, env);

  if (status !== 'ok') {
    return new Graph();
  }

  const tx = db.transaction(types, 'readonly');
  const graph = new Graph();
  for (const type of types) {
    graph.addNode(type, {
      label: type,
      size: 10,
    });
    const store = tx.objectStore(type);
    for await (const cursor of store.iterate()) {
      const node = cursor.value;
      if (!graph.hasNode(node.id)) {
        graph.addNode(node.id, { ...node, label: node.name, size: 2 });
      }
      graph.addDirectedEdge(node.id, type, {
        label: 'is type',
      });
    }
  }

  await tx.done;
  circular.assign(graph);
  return graph;
}

async function getListOfType(type: PokemonType, env: WorkerEnvironment) {
  console.log(`Reading ${type} pokemon from IDB`);
  const list: Pokemon[] = [];
  const { status, db } = await openIDB<TypesIDB>('poke-types', 1, env);

  if (status !== 'ok') {
    return [];
  }

  const tx = db.transaction(type, 'readonly');
  for await (const cursor of tx.store.iterate()) {
    list.push(cursor.value);
  }

  await tx.done;
  console.log(`Loaded ${list.length} ${type} pokemon`);
  return list;
}

async function postSelectedList(
  type: PokemonType,
  multicaster: Multicaster<SharedWorkerMsgName, GetListOfTypeMsg>,
  env: WorkerEnvironment
) {
  const res = await getListOfType(type, env);
  for (const rx of multicaster.getPorts('get-list-of-type')) {
    rx.postMessage({
      name: 'get-list-of-type',
      response: {
        status: 'OK',
        value: res,
      },
    });
  }
}
