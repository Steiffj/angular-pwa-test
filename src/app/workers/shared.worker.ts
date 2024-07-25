/// <reference lib="DOM" />

import { WorkerEnvironment } from 'idb/utils/open-idb';
import { SharedWorkerMsg } from '../shared-worker/messages';
import { SharedWorkerOnconnect } from '../worker-types/typed-shared-worker';
import { SharedWorkerHandler } from './shared-worker-handler';

const env: WorkerEnvironment = {
  apiUrl: 'https://pokeapi.co/api/v2/',
  mode: 'ram',
};
declare let onconnect: SharedWorkerOnconnect<SharedWorkerMsg>;
const handler = new SharedWorkerHandler(env);
onconnect = handler.onconnect;
