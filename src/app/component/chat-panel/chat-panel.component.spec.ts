import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of } from 'rxjs';

import { ChatPanelComponent } from './chat-panel.component';
import { ChatService, ChatReply } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { MaterialModule } from '../../material-module';

describe('ChatPanelComponent', () => {
  let fixture: ComponentFixture<ChatPanelComponent>;
  let component: ChatPanelComponent;
  let chat: jasmine.SpyObj<ChatService>;
  let pending: Subject<ChatReply>;

  beforeEach(async () => {
    chat = jasmine.createSpyObj<ChatService>('ChatService', ['history', 'ask']);
    chat.history.and.returnValue(of([{ question: 'old q', answer: 'old a', at: '2026-11-15T10:00:00Z' }]));
    pending = new Subject<ChatReply>();
    chat.ask.and.returnValue(pending);

    await TestBed.configureTestingModule({
      declarations: [ChatPanelComponent],
      imports: [FormsModule, NoopAnimationsModule, MaterialModule],
      providers: [
        { provide: ChatService, useValue: chat },
        { provide: AuthService, useValue: { signInUrl: 'https://club.test/oauth2/authorization/cognito' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatPanelComponent);
    component = fixture.componentInstance;
  });

  function open() {
    component.open = true;
    component.ngOnChanges({ open: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true } } as any);
    fixture.detectChanges();
  }

  function el(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function send(q: string) {
    component.draft = q;
    fixture.detectChanges();
    (el().querySelector('[data-test=send]') as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  it('panel: title says Spring AI for the springai variant', () => {
    component.variant = 'springai';
    open();
    expect(el().querySelector('.chat-title')!.textContent!.trim()).toBe('Club Assistant (Spring AI)');
  });

  it('panel: title is plain for the default variant', () => {
    open();
    expect(el().querySelector('.chat-title')!.textContent!.trim()).toBe('Club Assistant');
  });

  it('panel: sends with its variant', () => {
    component.variant = 'springai';
    open();
    send('Where am I?');
    expect(chat.ask).toHaveBeenCalledWith('Where am I?', 'springai');
  });

  it('panel: does not load history while closed', () => {
    fixture.detectChanges();
    expect(chat.history).not.toHaveBeenCalled();
  });

  it('panel: loads history on open', () => {
    open();
    expect(chat.history).toHaveBeenCalledTimes(1);
    expect(el().textContent).toContain('old q');
    expect(el().textContent).toContain('old a');
  });

  it('panel: send disabled while waiting', () => {
    open();
    send('Where am I?');
    const button = el().querySelector('[data-test=send]') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
    expect(el().textContent).toContain('thinking');
    pending.next({ answer: 'You are #7.' });
    pending.complete();
    fixture.detectChanges();
    expect(el().textContent).toContain('You are #7.');
    expect(el().textContent).not.toContain('thinking');
  });

  it('panel: sends the question once, trimmed', () => {
    open();
    send('  hi  ');
    expect(chat.ask).toHaveBeenCalledOnceWith('hi', 'sdk');
  });

  it('panel: blank question is not sent', () => {
    open();
    send('   ');
    expect(chat.ask).not.toHaveBeenCalled();
  });

  it('panel: input is limited to 500 characters', () => {
    open();
    const input = el().querySelector('[data-test=question]') as HTMLTextAreaElement;
    expect(input.maxLength).toBe(500);
  });

  it('panel: signin refusal shows link to signInUrl', () => {
    open();
    send('hi');
    pending.next({ refusal: 'signin' });
    fixture.detectChanges();
    const link = el().querySelector('a[data-test=signin]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('https://club.test/oauth2/authorization/cognito');
  });

  it('panel: other refusals show their message', () => {
    open();
    send('hi');
    pending.next({ refusal: 'daily_limit', message: "You've reached today's limit." });
    fixture.detectChanges();
    expect(el().textContent).toContain("You've reached today's limit.");
  });

  it('panel: script tag in answer is not rendered as a script', () => {
    open();
    send('hi');
    pending.next({ answer: 'Hi <script>window.__pwned = 1</script><img src=x onerror="window.__pwned=2">' });
    fixture.detectChanges();
    const answers = el().querySelector('[data-test=messages]') as HTMLElement;
    expect(answers.querySelector('script')).toBeNull();
    expect(answers.innerHTML).not.toContain('onerror');
    expect((window as any).__pwned).toBeUndefined();
  });

  it('panel: markdown table in an answer renders as a table', () => {
    open();
    send('standings');
    pending.next({ answer: '| Rank | Player |\n|---|---|\n| 1 | Jane Lee |' });
    fixture.detectChanges();
    expect(el().querySelector('[data-test=messages] table')).not.toBeNull();
  });

  it('panel: close button emits closed', () => {
    open();
    let closed = false;
    component.closed.subscribe(() => closed = true);
    (el().querySelector('[data-test=close]') as HTMLButtonElement).click();
    expect(closed).toBeTrue();
  });
  it('panel: Enter that confirms a Chinese IME candidate does not send', () => {
    open();
    component.draft = '我的积';
    fixture.detectChanges();
    const input = el().querySelector('[data-test=question]') as HTMLTextAreaElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }));
    expect(chat.ask).not.toHaveBeenCalled();
    expect(component.draft).toBe('我的积');
  });

  it('panel: plain Enter sends, Shift+Enter does not', () => {
    open();
    component.draft = 'hi';
    fixture.detectChanges();
    const input = el().querySelector('[data-test=question]') as HTMLTextAreaElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }));
    expect(chat.ask).not.toHaveBeenCalled();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(chat.ask).toHaveBeenCalledOnceWith('hi', 'sdk');
  });
});
