/// <reference lib="DOM" />

import { openDB } from 'idb';
import { SharedWorkerOnconnect } from '../worker-types/typed-shared-worker';
import { SharedWorkerHandler } from './shared-worker-handler';
import { SharedWorkerMsg } from './messages';

declare let onconnect: SharedWorkerOnconnect<SharedWorkerMsg>;
const handler = new SharedWorkerHandler(openDB);
onconnect = handler.onconnect;
