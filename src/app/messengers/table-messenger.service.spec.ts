import { TestBed } from '@angular/core/testing';

import { TableMessengerService } from './table-messenger.service';

describe('TableMessengerService', () => {
  let service: TableMessengerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableMessengerService],
    });
    service = TestBed.inject(TableMessengerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
