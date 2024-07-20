import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableWindowComponent } from './table.component';

describe('TableWindowComponent', () => {
  let component: TableWindowComponent;
  let fixture: ComponentFixture<TableWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableWindowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
