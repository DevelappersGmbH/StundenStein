import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReports2Component } from './userreports2.component';

describe('Userreports2Component', () => {
  let component: UserReports2Component;
  let fixture: ComponentFixture<UserReports2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserReports2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserReports2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
