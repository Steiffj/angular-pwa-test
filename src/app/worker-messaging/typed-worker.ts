import { Messages } from './message-types';
import { UnionToIntersection } from './union-to-intersection';

type Worker<T> = T extends {
  type: infer A;
  payload: infer B;
  response: infer C;
}
  ? {
      postMessage: (
        data: { type: A; payload: B },
        options?: StructuredSerializeOptions
      ) => void;
      onmessage: (event: MessageEvent<{ type: A; response: C }>) => void;
    }
  : never;

/**
 * Strongly typed web worker interface.
 *
 * _Note_: the request/response types are set up from the perspective of the main thread (or the script that spawned the worker).
 * This means `postMessage` requires a `payload`, while an `onmessage` listener function will receive a `response`.
 * The `onmessage`/`postMessage` arguments are reversed from the perspective of the worker thread.
 *
 * @see {@link WorkerOnmessage} and {@link WorkerPostMessage} for strongly typing the associated worker script.
 */
export type TypedWorker<T> = UnionToIntersection<Worker<T>>;

/**
 * Provides strong typing for `Worker.onmessage` within a web worker script.
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

  // Declare the global `onmessage` function in the worker script file.
  declare let onmessage: WorkerOnmessage<Messages>;
  onmessage = (...) => { ... };
 * ```
 */
export type WorkerOnmessage<T> = UnionToIntersection<
  T extends {
    type: infer A;
    payload: infer B;
    response: infer _;
  }
    ? (event: MessageEvent<{ type: A; payload: B }>) => void
    : never
>;

/**
   * Provides strong typing for `Worker.postMessage` within a web worker script.
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
  
    // Declare the global `postMessage` function in the worker script file.
    declare const postMessage: WorkerPostMessage<Messages>;
   * ```
   */
export type WorkerPostMessage<T> = UnionToIntersection<
  T extends {
    type: infer A;
    payload: infer _;
    response: infer C;
  }
    ? (event: { type: A; response: C }) => void
    : never
>;