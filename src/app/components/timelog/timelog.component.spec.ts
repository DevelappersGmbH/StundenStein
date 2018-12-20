import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeLogComponent } from './timelog.component';
import {Project} from '../../model/project.interface';
import {MatDialog} from '@angular/material';
import {ViewContainerRef} from '@angular/core';
import {DeleteWarningComponent} from '../delete-warning/delete-warning.component';
import {detectChanges} from '@angular/core/src/render3';

describe('TimeLogComponent', () => {
  let dialog: MatDialog;
  let component: TimeLogComponent;
  let fixture: ComponentFixture<TimeLogComponent>;
  const project: Project = {
    id: 1,
    name: 'prototypeProject',
    color: 'blue'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    dialog = TestBed.get(MatDialog);
    fixture = TestBed.createComponent(TimeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set edit button icon to edit when project set and to assignment when not', () => {
    component.projectControl.setValue(undefined);
    expect(component.editMode).toBe('assignment');
    component.projectControl.setValue(project);
    expect(component.editMode).toBe('edit');
  });

  it('should set booked to true when project set and vice versa', () => {
    component.projectControl.setValue(undefined);
    expect(component.timeLog.booked).toBe('false');
    component.projectControl.setValue(project);
    expect(component.timeLog.booked).toBe('true');
  });

  it('should set warning class to transparent when project set and vice versa', () => {
    const warning = fixture.debugElement.nativeElement.querySelector('#warning');
    component.projectControl.setValue(undefined);
    expect(warning.className).toBe('warning');
    component.projectControl.setValue(project);
    expect(warning.className).toBe('transparent');
  });

  it('tracked time should be updated if edit button clicked', () => {
    spyOn(component, 'calculateTime');
    component.ngOnInit();
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    expect(component.calculateTime).toHaveBeenCalled();
  });

  it('updates should be sent via data service if edit button clicked', () => {
    spyOn(component, 'updateTimeLog');
    component.ngOnInit();
    fixture.debugElement.nativeElement.querySelector('#btnEdit').click();
    expect(component.updateTimeLog).toHaveBeenCalled();
  });

  it('should show warning when delete button clicked', () => {
    spyOn(component, 'showDeleteWarning');
    component.ngOnInit();
    fixture.debugElement.nativeElement.querySelector('#btnDel').click();
    expect(component.showDeleteWarning).toHaveBeenCalled();
  });

  it('should do nothing when delete warning rejected and delete when accepted', () => {
    const dialogRef = dialog.open(DeleteWarningComponent);
    spyOn(component, 'deleteTimeLog');
    fixture.detectChanges();
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        expect(component.deleteTimeLog).toHaveBeenCalled();
      } else {
        // do nothing
      }
    });
  });

});
