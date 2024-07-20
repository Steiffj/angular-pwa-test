import { Messages, MsgStruct } from './message-types';
import {
  MsgPort,
  SharedWorkerOnconnect,
  TypedSharedWorker,
} from './typed-shared-worker';

export function createSharedWorker<
  T extends MsgStruct<string, unknown, unknown>
>(url: URL, options?: string | WorkerOptions): TypedSharedWorker<T> {
  if (typeof SharedWorker === 'undefined') {
    throw new Error(
      'Shared workers are not available in this environment. Catch this error and provide a fallback implementation.'
    );
  }

  return new SharedWorker(url, options) as TypedSharedWorker<T>;
}

// Shared worker onconnect
declare let onconnect: SharedWorkerOnconnect<Messages>;
const rxs: MsgPort<Messages>[] = [];
onconnect = (event) => {
  const port = event.ports[0];
  rxs.push(port);
  port.onmessage = (e) => {
    if (e.data.type === 'concat') {
      const payload = e.data.payload;
      console.log(payload);
    }

    rxs.forEach((rx) => {
      rx.postMessage({
        type: 'multiply',
        response: {
          status: 'OK',
          value: 8,
        },
      });
    });
  };
  port.postMessage({
    type: 'multiply',
    response: {
      status: 'OK',
      value: 25,
    },
  });
};

const sw = createSharedWorker<Messages>(new URL('./'));
sw.port.onmessage = (event) => {
  const type = event.data.type;
  if (type === 'concat') {
    sw.port.postMessage({
      type,
      payload: ['', ''],
    });
  }
};
