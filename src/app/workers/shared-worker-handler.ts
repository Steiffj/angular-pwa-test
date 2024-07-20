/// <reference lib="DOM" />

import Graph from 'graphology';
import { circular } from 'graphology-layout';
import idb from 'idb';
import { PokemonType } from '../__typegen/types';
import {
  SharedWorkerMsg,
  SharedWorkerMsgName,
} from '../shared-worker/messages';
import { Pokemon } from '../store/pokemon';
import { IDB, TypesIDB } from '../store/worker-generics';
import {
  MsgPort,
  SharedWorkerOnconnect,
} from '../worker-types/typed-shared-worker';

export class SharedWorkerHandler {
  // Track which data each rx is interested in.
  readonly ports = new Map<SharedWorkerMsgName, MsgPort<SharedWorkerMsg>[]>();
  #graph: Graph = new Graph();

  private setPort(
    port: MsgPort<SharedWorkerMsg>,
    messages: SharedWorkerMsgName[]
  ) {
    const registered: SharedWorkerMsgName[] = [];
    for (const msg of messages) {
      const ports = this.ports.get(msg) ?? [];
      if (!ports.includes(port)) {
        this.ports.set(msg, [port, ...ports]);
        registered.push(msg);
      }
    }
    return registered;
  }

  private clearPort(port: MsgPort<SharedWorkerMsg>) {
    for (const activePorts of this.ports.values()) {
      const index = activePorts.indexOf(port);
      if (index > -1) {
        activePorts.splice(index, 1);
      }
    }
  }

  private getPorts(msg: SharedWorkerMsgName) {
    return this.ports.get(msg) ?? [];
  }

  constructor(readonly openDB: typeof idb.openDB<TypesIDB>) {}

  readonly onconnect: SharedWorkerOnconnect<SharedWorkerMsg> = (e) => {
    const port = e.ports[0];

    port.onmessage = async ({ data }) => {
      const name = data.name;
      switch (name) {
        case 'register': {
          const registered = this.setPort(port, data.payload);
          port.postMessage({
            name,
            response: {
              status: 'OK',
              value: registered,
            },
          });
          break;
        }
        case 'unregister': {
          this.clearPort(port);
          break;
        }
        case 'get-list-of-type': {
          const res = await this.getListOfType(data.payload);
          for (const rx of this.getPorts(name)) {
            rx.postMessage({
              name,
              response: {
                status: 'OK',
                value: res,
              },
            });
          }
          break;
        }
        case 'misc': {
          for (const rx of this.getPorts(name)) {
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
          this.#graph = await this.getPokemonTypeGraph(data.payload);
          const serialized = this.#graph.export();
          for (const rx of this.getPorts(name)) {
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

  async getListOfType(type: PokemonType) {
    console.log('Reading some pokemon from IDB');
    const list: Pokemon[] = [];
    const idb: IDB<TypesIDB> = await this.openDB('poke-types', 1);
    const tx = idb.transaction(type, 'readonly');

    for await (const cursor of tx.store.iterate()) {
      list.push(cursor.value);
    }

    await tx.done;
    console.log(`Loaded ${list.length} ${type} pokemon`);
    return list;
  }

  async getPokemonTypeGraph(types: PokemonType[]) {
    console.log('Creating graph from pokemon types');
    // const idb: IDB<TypesIDB> = await this.openDB('poke-types', 1);
    // const tx = idb.transaction(types, 'readonly');
    const graph = new Graph();
    // for (const type of types) {
    //   graph.addNode(type, {
    //     label: type,
    //     size: 10,
    //   });
    //   const store = tx.objectStore(type);
    //   for await (const cursor of store.iterate()) {
    //     const node = cursor.value;
    //     if (!graph.hasNode(node.id)) {
    //       graph.addNode(node.id, { ...node, label: node.name, size: 2 });
    //     }
    //     graph.addDirectedEdge(node.id, type, {
    //       label: 'is type',
    //     });
    //   }
    // }

    // await tx.done;
    circular.assign(graph);
    return graph;
  }
}
