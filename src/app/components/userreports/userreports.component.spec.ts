import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserReportsComponent } from './userreports.component';
import { UserServiceMock } from '../../services/mocked-services/UserServiceMock.spec';
import { DataServiceMock } from '../../services/mocked-services/DataServiceMock.spec';
import { UserService } from 'src/app/services/user/user.service';
import { DataService } from 'src/app/services/data/data.service';
import { MatBadgeModule, MatListModule, MatProgressSpinnerModule, MatDialogModule} from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserReportsComponent', () => {
  let component: UserReportsComponent;
  let fixture: ComponentFixture<UserReportsComponent>;
  let userService: UserService;
  let dataService: DataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatProgressSpinnerModule, MatBadgeModule, MatListModule, MatDialogModule],
      declarations: [ UserReportsComponent ],
      providers : [{provide: UserService, useClass : UserServiceMock},
      {provide: DataService, useClass: DataServiceMock}],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserReportsComponent);
    component = fixture.componentInstance;
    userService = TestBed.get(UserService);
    dataService = TestBed.get(DataService);
    fixture.detectChanges();
    component.date = DataServiceMock.getMockTimeLog().timeStopped;
    component.timeLogs = new Array(DataServiceMock.getMockTimeLog());
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set generalArray correctly', () => {
    expect(component.generalArray).toEqual(new Array(['TestProject', 100, 'Red', 100, 5, 5]));
  });

  it('should set time correctly to hh:mm format', () => {
    expect(component.getRequiredTime(0)).toBe('05:00');
  });
  it('should return true if ther is a timelog in the correspondent time period', () => {
    expect(component.projectExists()).toBe(true);
  });
  it('should return correct percentage of billable projects', () => {
    expect(component.getBillPercent(0)).toBe('100% billable');
  });
  it('should return correct total time', () => {
    expect(component.getTotalTime(false)).toBe('05:00');
  });
});
