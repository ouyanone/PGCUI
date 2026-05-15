import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <div class="confirm-delete-dialog">
      <div class="confirm-icon">
        <mat-icon>delete_forever</mat-icon>
      </div>
      <h2 mat-dialog-title>Delete Donation</h2>
      <mat-dialog-content>
        <p>Are you sure you want to delete</p>
        <p class="item-name">"{{ data.name }}"?</p>
        <p class="warning-text">This action cannot be undone.</p>
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        <button mat-stroked-button (click)="cancel()" class="cancel-btn">Cancel</button>
        <button mat-raised-button color="warn" (click)="confirm()" class="delete-btn">
          <mat-icon>delete</mat-icon> Delete
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-delete-dialog {
      padding: 8px 8px 0;
      text-align: center;
      min-width: 340px;
    }
    .confirm-icon mat-icon {
      font-size: 52px;
      width: 52px;
      height: 52px;
      color: #e53935;
      margin-bottom: 8px;
    }
    h2[mat-dialog-title] {
      text-align: center;
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 4px;
    }
    mat-dialog-content {
      text-align: center;
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
    }
    .item-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 15px;
      margin: 2px 0 8px;
      word-break: break-word;
    }
    .warning-text {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
    mat-dialog-actions {
      padding: 16px 0 20px !important;
      gap: 12px;
    }
    .cancel-btn { min-width: 100px; }
    .delete-btn { min-width: 100px; }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}

  confirm() { this.dialogRef.close(true); }
  cancel()  { this.dialogRef.close(false); }
}
