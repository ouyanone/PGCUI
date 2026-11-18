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

/** Which backend answers: the Anthropic Java SDK bot, or the Spring AI one. Both share history. */
export type ChatVariant = 'sdk' | 'springai';

/** The club assistant's endpoints. The session cookie is the member's credential. */
@Injectable({ providedIn: 'root' })
export class ChatService {

  constructor(private http: HttpClient, private auth: AuthService) {}

  history(): Observable<ChatExchange[]> {
    return this.http
      .get<ChatExchange[]>(`${this.auth.backendUrl}/webapi/chat/history`, { withCredentials: true })
      .pipe(catchError(() => of([] as ChatExchange[])));
  }

  ask(question: string, variant: ChatVariant = 'sdk'): Observable<ChatReply> {
    const path = variant === 'springai' ? '/webapi/chat/spring' : '/webapi/chat';
    return this.http
      .post<ChatReply>(`${this.auth.backendUrl}${path}`, { question }, { withCredentials: true })
      .pipe(catchError((e: HttpErrorResponse) => of(
        e.status === 401 ? { refusal: 'signin' }
          : e.error && typeof e.error === 'object' && e.error.refusal ? e.error as ChatReply
          : { refusal: 'unavailable' })));
  }
}
