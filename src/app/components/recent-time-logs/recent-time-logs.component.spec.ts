import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentTimeLogsComponent } from './recent-time-logs.component';
import { UserServiceMock } from '../../services/mocked-services/UserServiceMock.spec';
import { DataServiceMock } from '../../services/mocked-services/DataServiceMock.spec';
import { UserService } from 'src/app/services/user/user.service';
import { DataService } from 'src/app/services/data/data.service';
import { MatBadgeModule, MatListModule, MatProgressSpinnerModule} from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RecentTimeLogsComponent', () => {
  let component: RecentTimeLogsComponent;
  let fixture: ComponentFixture<RecentTimeLogsComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should compare dates correctly', () => {
    component.ngOnInit();
    let d1 = new Date('December 17, 2018 03: 24: 00');
    let d2 = new Date('December 17, 2018 03: 24: 00');
    expect(component.compareDatesEqual(d1, d2)).toBeTruthy();
    d2 = new Date('December 18, 2018 03: 24: 00');
    expect(component.compareDatesEqual(d1, d2)).toBeFalsy();
    d1 = new Date('December 17, 2018 03: 24: 00');
    d2 = new Date('December 17, 2018 06: 49: 01');
    expect(component.compareDatesEqual(d1, d2)).toBeTruthy();
  });
});
