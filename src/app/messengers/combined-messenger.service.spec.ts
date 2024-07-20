import { TestBed } from '@angular/core/testing';

import { CombinedMessengerService } from './combined-messenger.service';

describe('CombinedMessengerService', () => {
  let service: CombinedMessengerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CombinedMessengerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
