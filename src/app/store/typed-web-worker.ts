/**
 * Strongly typed web worker.
 */
export interface TypedWebWorker<Command, Result>
  extends Omit<Worker, 'postMessage' | 'onmessage'> {
  onmessage: (this: Worker, ev: MessageEvent<Result>) => any | null;
  postMessage(message: Command): void;
}
