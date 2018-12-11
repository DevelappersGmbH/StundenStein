import { DataService } from 'src/app/services/data/data.service';
import { DataServiceMock } from './../../services/mocked-services/DataServiceMock.spec';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeLogComponent } from './timelog.component';
import { MatFormFieldModule, MatAutocompleteModule, MatDialogModule } from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TimelogComponent', () => {
  let component: TimeLogComponent;
  let fixture: ComponentFixture<TimeLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatFormFieldModule, MatAutocompleteModule, MatDialogModule],
      declarations: [ TimeLogComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: DataService, useClass: DataServiceMock}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
