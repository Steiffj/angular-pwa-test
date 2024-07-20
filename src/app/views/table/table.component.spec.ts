import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMessengerService } from 'messengers/table-messenger.service';
import { TableWindowComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableWindowComponent;
  let fixture: ComponentFixture<TableWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [TableMessengerService],
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
