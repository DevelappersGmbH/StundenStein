import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentTimeLogsComponent } from './recent-time-logs.component';
import { UserServiceMock } from '../../services/mocked-services/UserServiceMock.spec';
import { DataServiceMock } from '../../services/mocked-services/DataServiceMock.spec';
import { UserService } from 'src/app/services/user/user.service';
import { DataService } from 'src/app/services/data/data.service';
import { MatBadgeModule, MatListModule, MatProgressSpinnerModule} from '@angular/material';
import { NO_ERRORS_SCHEMA }  from '@angular/core';

describe('RecentTimeLogsComponent', () => {
  let component: RecentTimeLogsComponent;
  let fixture: ComponentFixture<RecentTimeLogsComponent>;
  let userService: UserService;
  let dataService: DataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatProgressSpinnerModule, MatBadgeModule, MatListModule],
      declarations: [ RecentTimeLogsComponent ],
      providers : [{provide: UserService, useClass : UserServiceMock},
      {provide: DataService, useClass: DataServiceMock}],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentTimeLogsComponent);
    component = fixture.componentInstance;
    userService = TestBed.get(UserService);
    dataService = TestBed.get(DataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should have correct dateList', () => {
    let correctDateList = new Array();
    correctDateList.push(new Date("October 1, 2018"))
    component.ngOnInit();
    expect(component.dateList).toBe(correctDateList);
  })
});
