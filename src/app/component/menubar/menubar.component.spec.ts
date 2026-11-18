import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { MenubarComponent } from './menubar.component';
import { AuthService, AuthStatus } from '../../services/auth.service';
import { MaterialModule } from '../../material-module';

describe('MenubarComponent', () => {
  let fixture: ComponentFixture<MenubarComponent>;

  async function render(status: AuthStatus) {
    await TestBed.configureTestingModule({
      declarations: [MenubarComponent],
      imports: [RouterTestingModule, NoopAnimationsModule, MaterialModule],
      providers: [{ provide: AuthService, useValue: { getStatus: () => of(status), signInUrl: '/oauth2/authorization/cognito' } }],
      // app-chat-panel is tested on its own; here only whether the menubar offers it.
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MenubarComponent);
    fixture.detectChanges();
  }

  function assistantButton(): HTMLButtonElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('button[aria-label="Open club assistant"]');
  }

  it('menubar: icon hidden when logged out', async () => {
    await render({ loggedIn: false });
    expect(assistantButton()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-chat-panel')).toBeNull();
  });

  it('menubar: icon shown when logged in', async () => {
    await render({ loggedIn: true, name: 'Jane Lee' });
    expect(assistantButton()).not.toBeNull();
  });

  it('menubar: clicking the icon opens the panel', async () => {
    await render({ loggedIn: true, name: 'Jane Lee' });
    assistantButton()!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.chatOpen).toBe('sdk');
  });

  function sButton(): HTMLButtonElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('[data-test=chat-springai]');
  }

  function panels(): NodeListOf<Element> {
    return (fixture.nativeElement as HTMLElement).querySelectorAll('app-chat-panel');
  }

  it('menubar: S button hidden when logged out', async () => {
    await render({ loggedIn: false });
    expect(sButton()).toBeNull();
  });

  it('menubar: S button shows an S and opens the Spring AI panel', async () => {
    await render({ loggedIn: true, name: 'Jane Lee' });
    expect(sButton()!.getAttribute('aria-label')).toBe('Open club assistant (Spring AI)');
    expect(sButton()!.textContent!.trim()).toBe('S');
    sButton()!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.chatOpen).toBe('springai');
  });

  it('menubar: S after the chat icon switches bots, one panel only', async () => {
    await render({ loggedIn: true, name: 'Jane Lee' });
    assistantButton()!.click();
    fixture.detectChanges();
    sButton()!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.chatOpen).toBe('springai');
    expect(panels().length).toBe(1);
  });

  it('menubar: clicking S twice closes it', async () => {
    await render({ loggedIn: true, name: 'Jane Lee' });
    sButton()!.click();
    fixture.detectChanges();
    sButton()!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.chatOpen).toBeNull();
  });
});
