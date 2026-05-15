import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from 'src/app/services/player.service';
import { NewsRepresentation } from 'src/app/services/api/models/news-representation';

@Component({
  selector: 'app-news-dialog',
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'Edit News' : 'Add News' }}</h2>
    <mat-dialog-content style="min-width:480px">
      <form [formGroup]="form" style="display:flex;flex-direction:column;gap:12px;padding-top:8px">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Content</mat-label>
          <textarea matInput formControlName="content" rows="5"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Publish Date</mat-label>
          <input matInput type="date" formControlName="publishDate">
        </mat-form-field>
        <mat-slide-toggle formControlName="isActive" color="primary">Active</mat-slide-toggle>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="gap:8px;padding:12px 24px">
      <button mat-stroked-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Save</button>
    </mat-dialog-actions>
  `
})
export class NewsDialogComponent {
  form = this.fb.group({
    title: [this.data?.title ?? '', Validators.required],
    content: [this.data?.content ?? ''],
    publishDate: [this.data?.publishDate ?? ''],
    isActive: [this.data?.isActive ?? true],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NewsRepresentation | null,
    private ref: MatDialogRef<NewsDialogComponent>,
    private fb: FormBuilder,
    private service: PlayerService
  ) {}

  save() {
    const payload: NewsRepresentation = { ...this.form.value as any };
    const obs = this.data?.id
      ? this.service.updateNews(this.data.id, payload)
      : this.service.createNews(payload);
    obs.subscribe(() => this.ref.close('saved'));
  }

  close() { this.ref.close(); }
}
