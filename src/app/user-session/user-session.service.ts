import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  constructor() {}

  async initSharedUserSession() {
    console.log('Starting shared worker');
    const worker = new SharedWorker(
      new URL('./user-session.worker', import.meta.url),
      {
        name: 'PWA Test User Session Sync',
      }
    );
    worker.port.onmessage = (event) => {
      console.log('Received data from shared worker thread!!!');
      console.log(event.data);
    };

    worker.port.postMessage('hello from UI thread :)');
  }
}
