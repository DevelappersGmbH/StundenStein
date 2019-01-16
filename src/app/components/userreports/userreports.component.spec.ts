import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserReportsComponent } from './userreports.component';
import { MatFormFieldModule, MatAutocompleteModule, MatDialogModule } from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { DataServiceMock } from './../../services/mocked-services/DataServiceMock.spec';

describe('UserReportsComponent', () => {
  let component: UserReportsComponent;
  let fixture: ComponentFixture<UserReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatFormFieldModule, MatAutocompleteModule, MatDialogModule],
      declarations: [ UserReportsComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: DataService, useClass: DataServiceMock}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // component.timeLogs = DataServiceMock.getMockTimeLog();
    expect(component).toBeTruthy();
  });

  it('should set generalArray correctly', () => {

  });
});
