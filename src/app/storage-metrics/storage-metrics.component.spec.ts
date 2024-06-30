import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageMetricsComponent } from './storage-metrics.component';

describe('StorageMetricsComponent', () => {
  let component: StorageMetricsComponent;
  let fixture: ComponentFixture<StorageMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
