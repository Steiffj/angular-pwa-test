import { Injectable, isDevMode } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { Pokemon } from '../store/pokemon';

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  #worker?: SharedWorker;
  #incoming = new Subject<Pokemon[]>();

  async initSharedUserSession() {
    console.log('Starting shared worker');
    this.#worker = new SharedWorker(
      new URL('./user-session.worker', import.meta.url),
      {
        name: 'PWA Test User Session Sync',
        type: 'module',
      }
    );
    this.#worker.port.onmessage = (event) => {
      console.log('Received data from shared worker thread!!!');
      console.log(event.data);
      if (Array.isArray(event.data)) {
        this.#incoming.next(event.data);
      }
    };

    this.#worker.port.postMessage('hello from UI thread :)');
  }

  async getPokemonList() {
    if (!this.#worker) {
      return [];
    }

    const list = firstValueFrom(this.#incoming);
    this.#worker.port.postMessage('sombody wants pokemon!');
    return await list;
  }
}
