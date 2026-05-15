import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface AuthStatus {
  loggedIn: boolean;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly backendUrl = window.location.port === '4200'
    ? 'http://localhost:8080'
    : `${window.location.protocol}//${window.location.host}`;

  readonly signInUrl = `${this.backendUrl}/oauth2/authorization/cognito`;

  private status$: Observable<AuthStatus> | null = null;

  constructor(private http: HttpClient) {}

  getStatus(): Observable<AuthStatus> {
    if (!this.status$) {
      this.status$ = this.http
        .get<AuthStatus>(`${this.backendUrl}/webapi/auth/status`, { withCredentials: true })
        .pipe(shareReplay(1));
    }
    return this.status$;
  }
}
