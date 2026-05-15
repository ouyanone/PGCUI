import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { PhotoEvent, PhotoItem, EventPhotos } from 'src/app/services/api/models/photo-representation';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnInit {

  isLoggedIn = false;
  allEvents: PhotoEvent[] = [];
  eventGroups: EventPhotos[] = [];
  loading = true;

  // Upload panel (top-level)
  selectedUploadEventId: number | null = null;
  uploading = false;

  // Per-event upload state (for buttons inside event sections)
  uploadingEventId: number | null = null;

  // Lightbox state
  lightboxOpen = false;
  lightboxPhotos: PhotoItem[] = [];
  lightboxIndex = 0;

  private readonly backendUrl: string;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.backendUrl = window.location.port === '4200'
      ? 'http://localhost:8080'
      : `${window.location.protocol}//${window.location.host}`;
  }

  ngOnInit(): void {
    this.authService.getStatus().subscribe(s => {
      this.isLoggedIn = s.loggedIn;
      if (s.loggedIn) this.loadAllEvents();
    });
    this.loadPhotos();
  }

  loadAllEvents(): void {
    this.http.get<any[]>(`${this.backendUrl}/webapi/events`, { withCredentials: true })
      .subscribe(events => {
        this.allEvents = events.map(e => ({
          id: e.id,
          eventName: e.eventName,
          eventDate: e.eventDate
        }));
      });
  }

  loadPhotos(): void {
    this.loading = true;
    this.http.get<PhotoEvent[]>(`${this.backendUrl}/webapi/photos/events`, { withCredentials: true })
      .subscribe({
        next: events => {
          const requests = events.map(evt =>
            new Promise<EventPhotos>(resolve => {
              this.http.get<PhotoItem[]>(`${this.backendUrl}/webapi/photos/event/${evt.id}`, { withCredentials: true })
                .subscribe(photos => resolve({ event: evt, photos }));
            })
          );
          Promise.all(requests).then(groups => {
            this.eventGroups = groups.filter(g => g.photos.length > 0);
            this.loading = false;
          });
        },
        error: () => { this.loading = false; }
      });
  }

  photoUrl(photo: PhotoItem): string {
    return `${this.backendUrl}${photo.url}`;
  }

  thumbnailUrl(photo: PhotoItem): string {
    return `${this.backendUrl}${photo.thumbnailUrl || photo.url}`;
  }

  openLightbox(photos: PhotoItem[], index: number): void {
    this.lightboxPhotos = photos;
    this.lightboxIndex = index;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    document.body.style.overflow = '';
  }

  prevPhoto(): void {
    this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxPhotos.length) % this.lightboxPhotos.length;
  }

  nextPhoto(): void {
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxPhotos.length;
  }

  get currentLightboxUrl(): string {
    return this.photoUrl(this.lightboxPhotos[this.lightboxIndex]);
  }

  onFileSelected(event: any, eventId: number): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;
    this.uploadingEventId = eventId;
    this.uploading = true;

    const uploads = Array.from(files).map(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', String(eventId));
      return this.http.post<any>(`${this.backendUrl}/webapi/admin/photos/upload`, formData, { withCredentials: true }).toPromise();
    });

    Promise.all(uploads).then(() => {
      this.uploading = false;
      this.uploadingEventId = null;
      this.selectedUploadEventId = null;
      this.loadPhotos();
    }).catch(() => {
      this.uploading = false;
      this.uploadingEventId = null;
    });
  }

  deletePhoto(photo: PhotoItem, group: EventPhotos): void {
    if (!confirm(`Delete photo "${photo.originalName}"?`)) return;
    this.http.delete(`${this.backendUrl}/webapi/admin/photos/${photo.id}`, { withCredentials: true })
      .subscribe(() => {
        group.photos = group.photos.filter(p => p.id !== photo.id);
        if (group.photos.length === 0) {
          this.eventGroups = this.eventGroups.filter(g => g.event.id !== group.event.id);
        }
      });
  }
}
