import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from 'src/app/services/player.service';
import { PlayerScoreHistory, ScoreHistoryRound } from 'src/app/services/api/models/player-score-history';

@Component({
  selector: 'app-score-history',
  templateUrl: './score-history.component.html',
  styleUrls: ['./score-history.component.css']
})
export class ScoreHistoryComponent implements OnInit {

  history: PlayerScoreHistory | null = null;
  loading = true;
  failed = false;

  /** Event ids of the rounds the reader has opened. The newest starts open. */
  private openRounds = new Set<number>();

  readonly front = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  readonly back = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  constructor(
    private service: PlayerService,
    private ref: MatDialogRef<ScoreHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { playerId: number; returnToProfile?: boolean }
  ) {}

  ngOnInit() {
    this.service.getScoreHistory(this.data.playerId).subscribe({
      next: h => {
        this.history = h;
        this.loading = false;
        const newest = h?.rounds?.[0]?.eventId;
        if (newest != null) { this.openRounds.add(newest); }
      },
      error: () => { this.loading = false; this.failed = true; }
    });
  }

  get rounds(): ScoreHistoryRound[] {
    return this.history?.rounds ?? [];
  }

  /** Oldest first, so the trend chart reads left to right in time. */
  get chartRounds(): ScoreHistoryRound[] {
    return [...this.rounds].reverse();
  }

  isOpen(eventId?: number): boolean {
    return eventId != null && this.openRounds.has(eventId);
  }

  toggle(eventId?: number) {
    if (eventId == null) { return; }
    if (this.openRounds.has(eventId)) { this.openRounds.delete(eventId); }
    else { this.openRounds.add(eventId); }
  }

  // ── chart ────────────────────────────────────────────────────────────────
  // Bars are scaled between the best and worst round rather than from zero, so the
  // differences a golfer cares about are actually visible.

  private get grossScores(): number[] {
    return this.rounds.map(r => r.gross ?? 0).filter(g => g > 0);
  }

  barHeight(round: ScoreHistoryRound): number {
    const all = this.grossScores;
    if (!all.length) { return 0; }
    const best = Math.min(...all);
    const worst = Math.max(...all);
    const gross = round.gross ?? 0;
    if (worst === best) { return 60; }
    return 25 + ((gross - best) / (worst - best)) * 70;
  }

  barClass(round: ScoreHistoryRound): string {
    const all = this.grossScores;
    if (!all.length || all.length < 2) { return ''; }
    if (round.gross === Math.min(...all)) { return 'best'; }
    if (round.gross === Math.max(...all)) { return 'worst'; }
    return '';
  }

  /** Beyond this many rounds the chart scrolls instead of shrinking to slivers. */
  get chartScrolls(): boolean {
    return this.rounds.length > 25;
  }

  // ── hole cells ───────────────────────────────────────────────────────────

  /** Colour a hole by its result. Needs par; without it every cell stays neutral. */
  holeClass(round: ScoreHistoryRound, i: number): string {
    const par = round.pars?.[i];
    const strokes = round.holes?.[i];
    if (par == null || strokes == null) { return 'h-p'; }
    const diff = strokes - par;
    if (diff <= -2) { return 'h-e'; }
    if (diff === -1) { return 'h-b'; }
    if (diff === 0) { return 'h-p'; }
    if (diff === 1) { return 'h-1'; }
    return 'h-2';
  }

  /** Only offered when the reader arrived from the profile dialog, which closed to let
   *  this one open — otherwise there is no profile to go back to. */
  backToProfile() {
    this.ref.close({ backToProfile: true, playerId: this.data.playerId });
  }

  close() { this.ref.close(); }
}
