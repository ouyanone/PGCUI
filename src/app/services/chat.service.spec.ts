import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ChatService } from './chat.service';
import { AuthService } from './auth.service';

describe('ChatService', () => {
  let service: ChatService;
  let http: HttpTestingController;
  let base: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ChatService);
    http = TestBed.inject(HttpTestingController);
    base = TestBed.inject(AuthService).backendUrl;
  });

  afterEach(() => http.verify());

  it('history: GETs the member\'s last exchanges with the session cookie', () => {
    let got: any;
    service.history().subscribe(h => got = h);
    const req = http.expectOne(`${base}/webapi/chat/history`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush([{ question: 'q1', answer: 'a1', at: '2026-11-15T10:00:00Z' }]);
    expect(got[0].question).toBe('q1');
  });

  it('ask: POSTs the question as JSON with the session cookie', () => {
    let got: any;
    service.ask('Where am I?').subscribe(r => got = r);
    const req = http.expectOne(`${base}/webapi/chat`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    expect(req.request.body).toEqual({ question: 'Where am I?' });
    req.flush({ answer: 'You are #7.' });
    expect(got.answer).toBe('You are #7.');
  });

  it('service: 401 maps to signin', () => {
    let got: any;
    service.ask('hi').subscribe(r => got = r);
    http.expectOne(`${base}/webapi/chat`).flush({ refusal: 'signin' }, { status: 401, statusText: 'Unauthorized' });
    expect(got.refusal).toBe('signin');
  });

  it('service: other failures map to unavailable', () => {
    let got: any;
    service.ask('hi').subscribe(r => got = r);
    http.expectOne(`${base}/webapi/chat`).flush('boom', { status: 502, statusText: 'Bad Gateway' });
    expect(got.refusal).toBe('unavailable');
  });

  it('service: a refusal body with 200 passes through', () => {
    let got: any;
    service.ask('hi').subscribe(r => got = r);
    http.expectOne(`${base}/webapi/chat`).flush({ refusal: 'daily_limit', message: 'limit' });
    expect(got.refusal).toBe('daily_limit');
    expect(got.message).toBe('limit');
  });
});
