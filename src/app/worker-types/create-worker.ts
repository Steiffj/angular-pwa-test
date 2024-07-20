import { Messages, MsgStruct } from './message-types';
import {
  TypedWorker,
  WorkerOnmessage,
  WorkerPostMessage,
} from './typed-worker';

/**
 * Create a new dedicated web worker.
 * @param url worker script URL
 * @returns a new
 * @throws an error if `Worker` is not available in the current environment
 */
export function createWorker<T extends MsgStruct<string, unknown, unknown>>(
  url: URL,
  options?: WorkerOptions
): TypedWorker<T> {
  if (typeof Worker === 'undefined') {
    throw new Error(
      'Workers are not available in this environment. Catch this error and provide a fallback implementation.'
    );
  }

  return new Worker(url, options) as TypedWorker<T>;
}

const worker = createWorker<Messages>(new URL('./'));
worker.postMessage({
  type: 'multiply',
  payload: [2, 4],
});

worker.onmessage = ({ data }) => {
  if (data.response.status !== 'OK') {
    return;
  }

  if (data.type === 'split') {
    const a: string[] = data.response.value;
    console.log(a);
  }
};

// Worker onmessage
declare let onmessage: WorkerOnmessage<Messages>;
declare const postMessage: WorkerPostMessage<Messages>;
onmessage = (event) => {
  const type = event.data.type;
  if (type === 'concat') {
    postMessage({
      type,
      response: {
        status: 'OK',
        value: '',
      },
    });
  }

  postMessage({
    type: 'split',
    response: {
      status: 'OK',
      value: ['', ''],
      messages: ['It has been done', 'but not well'],
    },
  });
};
