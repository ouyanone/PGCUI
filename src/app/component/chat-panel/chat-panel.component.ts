import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { marked } from 'marked';

import { ChatService, ChatReply } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

interface ChatLine {
  question: string;
  /** Rendered Markdown, bound with [innerHTML] -- Angular's sanitizer strips scripts and handlers. */
  answerHtml?: string;
  refusal?: string;
  message?: string;
}

/** The club assistant: a panel that slides in from the right (full screen on phones). */
@Component({
  selector: 'app-chat-panel',
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.css']
})
export class ChatPanelComponent implements OnChanges {

  static readonly MAX_QUESTION = 500;

  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  lines: ChatLine[] = [];
  draft = '';
  waiting = false;
  readonly maxLength = ChatPanelComponent.MAX_QUESTION;
  private loaded = false;

  constructor(private chat: ChatService, public auth: AuthService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && !this.loaded) {
      this.loaded = true;
      this.chat.history().subscribe(history => {
        this.lines = history.map(h => ({ question: h.question, answerHtml: this.render(h.answer) }));
      });
    }
  }

  send(): void {
    const question = this.draft.trim();
    if (!question || this.waiting) {
      return;
    }
    const line: ChatLine = { question };
    this.lines = [...this.lines, line];
    this.draft = '';
    this.waiting = true;
    this.chat.ask(question).subscribe({
      next: (reply: ChatReply) => {
        if (reply.answer !== undefined) {
          line.answerHtml = this.render(reply.answer);
        } else {
          line.refusal = reply.refusal ?? 'unavailable';
          line.message = reply.message;
        }
        this.waiting = false;
      },
      error: () => {
        line.refusal = 'unavailable';
        this.waiting = false;
      },
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private render(markdown: string): string {
    return marked.parse(markdown ?? '', { async: false }) as string;
  }
}
