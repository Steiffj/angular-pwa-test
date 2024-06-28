import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class DataControlSwService {
  swUpdate = inject(SwUpdate);
  constructor() {}
}
