import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { AuthService } from 'src/app/services/auth.service';
import { NewsRepresentation } from 'src/app/services/api/models/news-representation';
import { StandingRepresentation } from 'src/app/services/api/models/standing-representation';
import { EventScoreDetail, PlayerScoreRow, RewardRow, GameStats, StatEntry } from 'src/app/services/api/models/event-score-detail';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  news: NewsRepresentation[] = [];
  standings: StandingRepresentation[] = [];
  gameScores: EventScoreDetail[] = [];
  isLoggedIn = false;
  calculating = false;

  // Carousel
  carouselPhotos: any[] = [];
  carouselIndex = 0;
  carouselFading = false;
  carouselProgressKey = 0;   // increment to restart CSS progress animation
  private carouselTimer: any = null;
  private readonly backendUrl: string;

  sortState: { [eventId: number]: { col: string; dir: 'asc' | 'desc' } } = {};
  gameStats: { [eventId: number]: GameStats } = {};

  private readonly HOLES = ['hole1','hole2','hole3','hole4','hole5','hole6','hole7','hole8','hole9',
                            'hole10','hole11','hole12','hole13','hole14','hole15','hole16','hole17','hole18'];

  constructor(private service: PlayerService, private authService: AuthService) {
    this.backendUrl = window.location.port === '4200'
      ? 'http://localhost:8080'
      : `${window.location.protocol}//${window.location.host}`;
  }

  ngOnInit() {
    this.authService.getStatus().subscribe(s => { this.isLoggedIn = s.loggedIn; });
    this.service.getNews().subscribe(data => { this.news = data; });
    this.service.getStandings().subscribe(data => { this.standings = data.filter(p => (p.pgcPoints ?? 0) > 0); });
    this.service.getGameScores().subscribe(data => { this.gameScores = data; this.buildAllStats(data); });
    this.service.getCarouselPhotos(20).subscribe(photos => {
      this.carouselPhotos = photos;
      if (photos.length > 1) this.startCarousel();
    });
  }

  ngOnDestroy() {
    this.stopCarousel();
  }

  // ── Carousel ──────────────────────────────────────────────
  carouselPhotoUrl(photo: any): string {
    return `${this.backendUrl}${photo.thumbnailUrl}`;
  }

  startCarousel() {
    this.stopCarousel();
    this.carouselTimer = setInterval(() => this.advanceCarousel(), 6000);
  }

  stopCarousel() {
    if (this.carouselTimer) { clearInterval(this.carouselTimer); this.carouselTimer = null; }
  }

  advanceCarousel() {
    this.carouselFading = true;
    setTimeout(() => {
      this.carouselIndex = (this.carouselIndex + 1) % this.carouselPhotos.length;
      this.carouselFading = false;
      this.carouselProgressKey++;
    }, 500);
  }

  goToSlide(i: number) {
    if (i === this.carouselIndex) return;
    this.stopCarousel();
    this.carouselFading = true;
    setTimeout(() => {
      this.carouselIndex = i;
      this.carouselFading = false;
      this.carouselProgressKey++;
    }, 500);
    this.startCarousel();
  }

  prevSlide() {
    this.stopCarousel();
    this.carouselFading = true;
    setTimeout(() => {
      this.carouselIndex = (this.carouselIndex - 1 + this.carouselPhotos.length) % this.carouselPhotos.length;
      this.carouselFading = false;
      this.carouselProgressKey++;
    }, 500);
    this.startCarousel();
  }

  nextSlide() {
    this.stopCarousel();
    this.advanceCarousel();
    this.startCarousel();
  }
  // ──────────────────────────────────────────────────────────

  calculatePoints() {
    this.calculating = true;
    this.service.calculatePoints().subscribe({
      next: () => {
        this.service.getStandings().subscribe(data => {
          this.standings = data.filter(p => (p.pgcPoints ?? 0) > 0);
          this.calculating = false;
        });
        this.service.getGameScores().subscribe(data => { this.gameScores = data; this.sortState = {}; this.buildAllStats(data); });
      },
      error: () => { this.calculating = false; }
    });
  }

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
    for (const game of games) {
      this.gameStats[game.eventId!] = this.computeStats(game);
    }
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

  parSum(pars: number[] | undefined, from: number, to: number): number {
    if (!pars) return 0;
    return pars.slice(from, to).reduce((a, b) => a + (b ?? 0), 0);
  }
}
