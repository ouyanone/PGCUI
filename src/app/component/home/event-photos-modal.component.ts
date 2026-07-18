import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EventPhotosDialogData {
  eventName: string;
  photos: any[];
  backendUrl: string;
}

@Component({
  selector: 'app-event-photos-modal',
  templateUrl: './event-photos-modal.component.html',
  styleUrls: ['./event-photos-modal.component.css']
})
export class EventPhotosModalComponent {
  lightboxIndex = -1;

  constructor(
    public dialogRef: MatDialogRef<EventPhotosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventPhotosDialogData
  ) {}

  close() { this.dialogRef.close(); }

  thumbnailUrl(photo: any): string {
    return `${this.data.backendUrl}${photo.thumbnailUrl || photo.url}`;
  }

  fullUrl(photo: any): string {
    return `${this.data.backendUrl}${photo.url}`;
  }

  openLightbox(index: number) { this.lightboxIndex = index; }
  closeLightbox() { this.lightboxIndex = -1; }

  prev() {
    this.lightboxIndex = (this.lightboxIndex - 1 + this.data.photos.length) % this.data.photos.length;
  }

  next() {
    this.lightboxIndex = (this.lightboxIndex + 1) % this.data.photos.length;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.lightboxIndex < 0) return;
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'Escape') this.closeLightbox();
  }
}
