import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePopoutShellComponent } from './table-popout-shell.component';

describe('TablePopoutShellComponent', () => {
  let component: TablePopoutShellComponent;
  let fixture: ComponentFixture<TablePopoutShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablePopoutShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablePopoutShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
