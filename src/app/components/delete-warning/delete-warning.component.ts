import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-delete-warning',
  templateUrl: './delete-warning.component.html',
  styleUrls: ['./delete-warning.component.scss']
})
export class DeleteWarningComponent implements OnInit {

  title: string;

  constructor(private dialogRef: MatDialogRef<DeleteWarningComponent>,
              @Inject(MAT_DIALOG_DATA) data) {

    this.title = data.description;
  }

  ngOnInit() {
  }

  delete() {
    const del = true;
    this.dialogRef.close(del);
  }

  close() {
    this.dialogRef.close();
  }

}
