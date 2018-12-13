import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../../errorpopup/error-dialog.component';


@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private errorMsgDialog: MatDialog) { }

  errorDialog(msg: string) {
    const dialogRef = this.errorMsgDialog.open(
      ErrorDialogComponent,
      {
        disableClose: true,
        autoFocus: true,
        closeOnNavigation: true,
        restoreFocus: true,
        maxWidth: '45vw',
        maxHeight: '85vh',
        panelClass: 'custom-dialog-container2',
        data: {message: msg},
    });
  }
}
