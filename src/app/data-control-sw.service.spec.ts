import { TestBed } from '@angular/core/testing';

import { DataControlSwService } from './data-control-sw.service';

describe('DataControlSwService', () => {
  let service: DataControlSwService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataControlSwService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
