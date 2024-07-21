/// <reference lib="DOM" />

import { SharedWorkerMsg } from '../shared-worker/messages';
import { SharedWorkerOnconnect } from '../worker-types/typed-shared-worker';
import { SharedWorkerHandler } from './shared-worker-handler';

declare let onconnect: SharedWorkerOnconnect<SharedWorkerMsg>;
const handler = new SharedWorkerHandler();
onconnect = handler.onconnect;
