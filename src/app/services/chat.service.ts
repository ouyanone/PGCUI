import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { AuthService } from './auth.service';

export interface ChatExchange {
  question: string;
  answer: string;
  at: string;
}

/** An answer, or a refusal: daily_limit | budget | signin | unavailable | invalid. */
export interface ChatReply {
  answer?: string;
  refusal?: string;
  message?: string;
}

/** The club assistant's two endpoints. The session cookie is the member's credential. */
@Injectable({ providedIn: 'root' })
export class ChatService {

  constructor(private http: HttpClient, private auth: AuthService) {}

  history(): Observable<ChatExchange[]> {
    return this.http
      .get<ChatExchange[]>(`${this.auth.backendUrl}/webapi/chat/history`, { withCredentials: true })
      .pipe(catchError(() => of([] as ChatExchange[])));
  }

  ask(question: string): Observable<ChatReply> {
    return this.http
      .post<ChatReply>(`${this.auth.backendUrl}/webapi/chat`, { question }, { withCredentials: true })
      .pipe(catchError((e: HttpErrorResponse) => of(
        e.status === 401 ? { refusal: 'signin' }
          : e.error && typeof e.error === 'object' && e.error.refusal ? e.error as ChatReply
          : { refusal: 'unavailable' })));
  }
}
