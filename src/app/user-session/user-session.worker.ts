/// <reference lib="DOM" />

import { openDB } from 'idb';
import { SharedWorkerOnconnect } from '../worker-types/typed-shared-worker';
import { UserSessionWorkerHandler } from './user-session-worker-handler';
import { UserSessionMsg } from './user-session.service';

declare let onconnect: SharedWorkerOnconnect<UserSessionMsg>;
const handler = new UserSessionWorkerHandler(openDB);
onconnect = handler.onconnect;
