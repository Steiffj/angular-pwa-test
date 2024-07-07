/// <reference lib="DOM" />

import { UnionToIntersection } from './union-to-intersection';

type SharedWorker<T> = T extends {
  type: infer A;
  payload: infer B;
  response: infer C;
}
  ? {
      start: () => void;
      close: () => void;
      readonly port: Omit<MessagePort, 'postMessage' | 'onmessage'> & {
        postMessage: (
          data: { type: A; payload: B },
          options?: StructuredSerializeOptions
        ) => void;
        onmessage: (event: MessageEvent<{ type: A; response: C }>) => void;
      };
      onerror: ((event: ErrorEvent) => any) | null;
    }
  : never;

/**
 * Strongly typed shared worker interface.
 */
export type TypedSharedWorker<T> = UnionToIntersection<SharedWorker<T>>;

/**
 * Provides strong typing for `SharedWorker.onconnect` within a shared worker script.
 * Includes `onmessage` and `postMessage` typing for connected `MessagePort`s.
 * 
 * _Note_: `onmessage` and `postMessage` are reversed from the perspective of the script that spawned this worker.
 * This means `postMessage` requires a `response`, while an `onmessage` listener function will receive a `payload`.
 * 
 * Usage:
 * ```typescript
 * // Worker request/response type definitions can be declared anywhere and imported.
 * type Messages =
  | MsgStruct<'add', number[], number>
  | MsgStruct<'multiply', number[], number>
  | MsgStruct<'concat', string[], string>
  | MsgStruct<'split', { value: string; delimiter: string }, string[]>;

  // Declare the global `onconnect` function in the worker script file.
  declare let onconnect: SharedWorkerOnconnect<Messages>;
  onconnect = (event) => { ... };
 * ```
 */
export type SharedWorkerOnconnect<T, D = any> = (
  event: Omit<MessageEvent<D>, 'ports'> & {
    ports: MsgPort<T>[];
  }
) => void;

export type MsgPort<T> = UnionToIntersection<
  T extends {
    type: infer A;
    payload: infer B;
    response: infer C;
  }
    ? Omit<MessagePort, 'postMessage' | 'onmessage'> & {
        postMessage: (
          data: { type: A; response: C },
          options?: StructuredSerializeOptions
        ) => void;
        onmessage: (event: MessageEvent<{ type: A; payload: B }>) => void;
      }
    : never
>;
