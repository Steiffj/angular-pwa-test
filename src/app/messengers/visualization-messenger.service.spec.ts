import { TestBed } from '@angular/core/testing';

import { VisualizationMessengerService } from './visualization-messenger.service';

describe('VisualizationMessengerService', () => {
  let service: VisualizationMessengerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualizationMessengerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
