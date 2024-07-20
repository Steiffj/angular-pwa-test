import { TestBed } from '@angular/core/testing';

import { CombinedMessengerService } from './combined-messenger.service';
import { TableMessengerService } from './table-messenger.service';
import { VisualizationMessengerService } from './visualization-messenger.service';

describe('CombinedMessengerService', () => {
  let service: CombinedMessengerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TableMessengerService,
        VisualizationMessengerService,
        CombinedMessengerService,
      ],
    });
    service = TestBed.inject(CombinedMessengerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
