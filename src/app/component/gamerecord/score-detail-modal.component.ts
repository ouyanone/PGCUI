import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventScoreDetail, PlayerScoreRow, RewardRow, GameStats, StatEntry } from 'src/app/services/api/models/event-score-detail';

export interface ScoreDetailDialogData {
  title: string;
  games: EventScoreDetail[];
}

@Component({
  selector: 'app-score-detail-modal',
  templateUrl: './score-detail-modal.component.html',
  styleUrls: ['./score-detail-modal.component.css']
})
export class ScoreDetailModalComponent implements OnInit {

  sortState: { [eventId: number]: { col: string; dir: 'asc' | 'desc' } } = {};
  gameStats: { [eventId: number]: GameStats } = {};
  tournamentTotals: Map<number, { playerName: string; gender: string; pgcHandicap: number | null; handicap: number | null; totalScore: number; totalNetScore: number }[]> = new Map();
  tournamentLastEventId: Map<number, number> = new Map();
  tournamentSortState: { [tid: number]: { col: string; dir: 'asc' | 'desc' } } = {};

  private readonly HOLES = ['hole1','hole2','hole3','hole4','hole5','hole6','hole7','hole8','hole9',
                            'hole10','hole11','hole12','hole13','hole14','hole15','hole16','hole17','hole18'];

  constructor(
    public dialogRef: MatDialogRef<ScoreDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScoreDetailDialogData
  ) {}

  ngOnInit() {
    this.buildAllStats(this.data.games);
    this.buildTournamentTotals(this.data.games);
  }

  close() { this.dialogRef.close(); }

  sortScores(game: EventScoreDetail, col: string) {
    const id = game.eventId!;
    const current = this.sortState[id];
    const dir: 'asc' | 'desc' = (current?.col === col && current?.dir === 'asc') ? 'desc' : 'asc';
    this.sortState[id] = { col, dir };
    game.scores?.sort((a: PlayerScoreRow, b: PlayerScoreRow) => {
      const va = (a as any)[col] ?? (typeof (a as any)[col] === 'string' ? '' : 0);
      const vb = (b as any)[col] ?? (typeof (b as any)[col] === 'string' ? '' : 0);
      if (typeof va === 'string') return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return dir === 'asc' ? va - vb : vb - va;
    });
  }

  sortIcon(eventId: number | undefined, col: string): string {
    const s = this.sortState[eventId ?? 0];
    if (!s || s.col !== col) return 'unfold_more';
    return s.dir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  private buildAllStats(games: EventScoreDetail[]) {
    this.gameStats = {};
    for (const game of games) this.gameStats[game.eventId!] = this.computeStats(game);
  }

  private computeStats(game: EventScoreDetail): GameStats {
    const eagleMap: { [name: string]: number } = {};
    const birdieMap: { [name: string]: number } = {};
    const parMap:    { [name: string]: number } = {};
    for (const row of (game.scores ?? [])) {
      let eagles = 0, birdies = 0, pars = 0;
      for (const h of this.HOLES) {
        const v = (row as any)[h];
        if (v == null) continue;
        if (v <= -2) eagles++;
        else if (v === -1) birdies++;
        else if (v === 0) pars++;
      }
      const name = row.playerName ?? '';
      if (eagles > 0) eagleMap[name] = (eagleMap[name] ?? 0) + eagles;
      if (birdies > 0) birdieMap[name] = (birdieMap[name] ?? 0) + birdies;
      if (pars > 0) parMap[name] = (parMap[name] ?? 0) + pars;
    }
    const top5 = (m: { [k: string]: number }): StatEntry[] =>
      Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    return { eagles: top5(eagleMap), birdies: top5(birdieMap), pars: top5(parMap) };
  }

  groupRewards(rewards: RewardRow[]): { group: string; items: RewardRow[] }[] {
    const map = new Map<string, RewardRow[]>();
    for (const r of rewards) {
      const key = r.rewardGroup?.trim() || r.rewardName || '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
  }

  holeClass(val: number | null | undefined): string {
    if (val === -1) return 'score-birdie';
    if (val != null && val <= -2) return 'score-eagle';
    return '';
  }

  buildTournamentTotals(games: EventScoreDetail[]) {
    this.tournamentTotals.clear();
    this.tournamentLastEventId.clear();
    const groups = new Map<number, EventScoreDetail[]>();
    for (const g of games) {
      if (g.tournamentId) {
        if (!groups.has(g.tournamentId)) groups.set(g.tournamentId, []);
        groups.get(g.tournamentId)!.push(g);
      }
    }
    groups.forEach((events, tid) => {
      const totalExpected = events[0].tournamentTotalEvents ?? 0;
      if (totalExpected === 0 || events.length !== totalExpected) return;
      this.tournamentLastEventId.set(tid, events[0].eventId!);
      const playerSets = events.map(e => new Set((e.scores || []).map(s => s.playerName!)));
      const allPlayers = [...playerSets[0]].filter(name => playerSets.every(s => s.has(name)));
      const rows = allPlayers.map(playerName => {
        let totalScore = 0, totalNetScore = 0;
        let gender = '', pgcHandicap: number | null = null, handicap: number | null = null;
        for (const event of events) {
          const row = (event.scores || []).find(s => s.playerName === playerName);
          if (row) {
            totalScore += row.totalScore ?? 0;
            totalNetScore += (row.netScore ?? 0);
            if (!gender && row.gender) gender = row.gender;
            if (pgcHandicap == null && row.pgcHandicap != null) pgcHandicap = row.pgcHandicap;
            if (handicap == null && row.handicap != null) handicap = row.handicap;
          }
        }
        return { playerName, gender, pgcHandicap, handicap, totalScore, totalNetScore };
      }).sort((a, b) => a.totalScore - b.totalScore);
      this.tournamentTotals.set(tid, rows);
    });
  }

  sortTournamentTotals(tid: number, col: string) {
    const current = this.tournamentSortState[tid];
    const dir: 'asc' | 'desc' = (current?.col === col && current?.dir === 'asc') ? 'desc' : 'asc';
    this.tournamentSortState[tid] = { col, dir };
    const rows = this.tournamentTotals.get(tid);
    if (!rows) return;
    rows.sort((a, b) => {
      const va = (a as any)[col] ?? (typeof (a as any)[col] === 'string' ? '' : 0);
      const vb = (b as any)[col] ?? (typeof (b as any)[col] === 'string' ? '' : 0);
      if (typeof va === 'string') return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return dir === 'asc' ? va - vb : vb - va;
    });
  }

  tournamentSortIcon(tid: number, col: string): string {
    const s = this.tournamentSortState[tid];
    if (!s || s.col !== col) return 'unfold_more';
    return s.dir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  isLastInTournament(game: EventScoreDetail): boolean {
    if (!game.tournamentId) return false;
    return this.tournamentLastEventId.get(game.tournamentId) === game.eventId;
  }

  parSum(pars: number[] | undefined, from: number, to: number): number {
    if (!pars) return 0;
    return pars.slice(from, to).reduce((a, b) => a + (b ?? 0), 0);
  }
}
