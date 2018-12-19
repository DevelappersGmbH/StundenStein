import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrtestComponent } from './urtest.component';

describe('UrtestComponent', () => {
  let component: UrtestComponent;
  let fixture: ComponentFixture<UrtestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrtestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrtestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
