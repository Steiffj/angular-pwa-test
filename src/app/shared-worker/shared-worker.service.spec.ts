import { TestBed } from '@angular/core/testing';

import { SharedWorkerService } from './shared-worker.service';

describe('SharedWorkerService', () => {
  let service: SharedWorkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedWorkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
