import { Component, Injectable, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  openDialog(s: string) {
    console.log(s);
  }
}
