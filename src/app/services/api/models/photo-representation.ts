export interface PhotoEvent {
  id: number;
  eventName: string;
  eventDate: string;
}

export interface PhotoItem {
  id: number;
  fileName: string;
  originalName: string;
  uploadedAt: string;
  url: string;
  thumbnailUrl: string;
}

export interface EventPhotos {
  event: PhotoEvent;
  photos: PhotoItem[];
}
