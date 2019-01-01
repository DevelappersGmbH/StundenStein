import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReportsComponent } from './userreports.component';

describe('Userreports2Component', () => {
  let component: UserReportsComponent;
  let fixture: ComponentFixture<UserReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
