/// <reference lib="DOM" />

import idb from 'idb';
import { PokemonType } from '../__typegen/types';
import { Pokemon } from '../store/pokemon';
import { IDB, TypesIDB } from '../store/worker-generics';
import {
  MsgPort,
  SharedWorkerOnconnect,
} from '../worker-messaging/typed-shared-worker';
import { UserSessionMsg, UserSessionMsgType } from './user-session.service';
import Graph from 'graphology';
import { circular } from 'graphology-layout';

export class UserSessionWorkerHandler {
  // Track which data each rx is interested in.
  readonly ports = new Map<UserSessionMsgType, MsgPort<UserSessionMsg>[]>();
  #graph: Graph = new Graph();

  private setPort(port: MsgPort<UserSessionMsg>, types: UserSessionMsgType[]) {
    const registered: UserSessionMsgType[] = [];
    for (const type of types) {
      const ports = this.ports.get(type) ?? [];
      if (!ports.includes(port)) {
        this.ports.set(type, [port, ...ports]);
        registered.push(type);
      }
    }
    return registered;
  }

  private getPorts(type: UserSessionMsgType) {
    return this.ports.get(type) ?? [];
  }

  constructor(readonly openDB: typeof idb.openDB<TypesIDB>) {}

  readonly onconnect: SharedWorkerOnconnect<UserSessionMsg> = (e) => {
    const port = e.ports[0];

    port.onmessage = async ({ data }) => {
      const type = data.type;
      switch (type) {
        case 'register': {
          const registered = this.setPort(port, data.payload);
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
          const res = await this.getListOfType(data.payload);
          for (const rx of this.getPorts(type)) {
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
          for (const rx of this.getPorts(type)) {
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
        case 'get-graph': {
          this.#graph = await this.getPokemonTypeGraph(data.payload);
          const serialized = this.#graph.export();
          for (const rx of this.getPorts(type)) {
            rx.postMessage({
              type,
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
    const idb: IDB<TypesIDB> = await this.openDB('poke-types', 1);
    const tx = idb.transaction(types, 'readonly');
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
}
