import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserreportsComponent } from './userreports.component';

describe('UserreportsComponent', () => {
  let component: UserreportsComponent;
  let fixture: ComponentFixture<UserreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
