import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { AuthService, AuthStatus } from 'src/app/services/auth.service';
import { ChatVariant } from 'src/app/services/chat.service';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})
export class MenubarComponent implements OnInit, OnDestroy {
  isDesktop = true;
  authStatus: AuthStatus = { loggedIn: false };
  /** Which club assistant is open, if any (signed-in members only). One panel at a time. */
  chatOpen: ChatVariant | null = null;
  private bpSub!: Subscription;
  private authSub!: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.bpSub = this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe(result => {
        this.isDesktop = !result.matches;
      });

    this.authSub = this.authService.getStatus().subscribe(status => {
      this.authStatus = status;
    });
  }

  toggleChat(variant: ChatVariant) {
    this.chatOpen = this.chatOpen === variant ? null : variant;
  }

  ngOnDestroy() {
    this.bpSub.unsubscribe();
    this.authSub.unsubscribe();
  }
}
