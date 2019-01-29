import { UserServiceMock } from './../../services/mocked-services/UserServiceMock.spec';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatAutocompleteModule, MatDialog } from '@angular/material';
import { DataService } from 'src/app/services/data/data.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTrackerComponent } from './time-tracker.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { DataServiceMock } from 'src/app/services/mocked-services/DataServiceMock.spec';
import { Favicons } from 'src/app/services/favicon/favicon.service';
import { ErrorService } from 'src/app/services/error/error.service';

describe('TimeTrackerComponent', () => {
  let component: TimeTrackerComponent;
  let fixture: ComponentFixture<TimeTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatAutocompleteModule ],
      declarations: [ TimeTrackerComponent ],
      providers: [{provide : DataService, useClass: DataServiceMock}, {provide: UserService, useClass: UserServiceMock},
        {provide: Favicons, useClass: Favicons}, {provide: ErrorService, useClass: ErrorService}, {provide: MatDialog, useValue: {}}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
});
