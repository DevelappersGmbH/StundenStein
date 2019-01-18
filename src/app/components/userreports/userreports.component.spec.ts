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
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should set generalArray correctly', () => {
    const correctGeneralArray = new Array();
    correctGeneralArray.push('TestProject', 100, 'Red', 100, 5, 5);
    component.date = DataServiceMock.getMockTimeLog().timeStopped;
    const temp = new Array();
    temp.push(DataServiceMock.getMockTimeLog());
    component.timeLogs = temp;
    console.log(component.timeLogs);
    component.ngOnInit();
    expect(component.generalArray).toEqual([correctGeneralArray]);
  });
});
