import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserReportsComponent } from './userreports.component';
import { UserServiceMock } from '../../services/mocked-services/UserServiceMock.spec';
import { DataServiceMock } from '../../services/mocked-services/DataServiceMock.spec';
import { UserService } from 'src/app/services/user/user.service';
import { DataService } from 'src/app/services/data/data.service';
import { MatBadgeModule, MatListModule, MatProgressSpinnerModule} from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserReportsComponent', () => {
  let component: UserReportsComponent;
  let fixture: ComponentFixture<UserReportsComponent>;
  let userService: UserService;
  let dataService: DataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatProgressSpinnerModule, MatBadgeModule, MatListModule],
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
    expect(component).toBeTruthy();
  });

  it('should have correct generalArray', () => {
    const correctGeneralArray = new Array();
    correctGeneralArray.push(['TestProject', 2.1, '#ff0000', 2.5, 2.5, 2.5]);
    component.ngOnInit();
    expect(component.generalArray).toBe(correctGeneralArray);
  });
});
