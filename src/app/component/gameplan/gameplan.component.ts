import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { AuthService } from '../../services/auth.service';
import { EventRepresentation } from '../../services/api/models/event-representation';
import { PlayerRepresentation } from '../../services/api/models/player-representation';
import { CourseRepresentation } from '../../services/api/models/course-representation';

interface TeeGroup {
  teeId: number;
  teeName: string;
  teeTime: string;
  players: TeePlayer[];
  editingName: boolean;
  editingTime: boolean;
}

interface TeePlayer {
  playerScoreId: number;
  playerId: number;
  playerName: string;
  handicap: number;
  pgcHandicap: number;
  gender: string;
}

const STRATEGIES = [
  { value: 'GHIN_BEST_TO_WORST',          label: 'GHIN Handicap — Best to Worst' },
  { value: 'GHIN_BEST_TO_WORST_BY_GENDER', label: 'GHIN Handicap — Best to Worst (by Gender)' },
  { value: 'PGC_BEST_TO_WORST',            label: 'PGC Handicap — Best to Worst' },
  { value: 'PGC_BEST_TO_WORST_BY_GENDER',  label: 'PGC Handicap — Best to Worst (by Gender)' },
  { value: 'GHIN_BEST_WITH_WORST',         label: 'GHIN Handicap — Best + Worst (Balanced)' },
  { value: 'PGC_BEST_WITH_WORST',          label: 'PGC Handicap — Best + Worst (Balanced)' },
  { value: 'RANDOM',                       label: 'Random' },
];

@Component({
  selector: 'app-gameplan',
  templateUrl: './gameplan.component.html',
  styleUrls: ['./gameplan.component.css']
})
export class GameplanComponent implements OnInit {

  step = 1;
  strategies = STRATEGIES;
  selectedStrategy = 'GHIN_BEST_TO_WORST';
  isLoggedIn = false;

  events: EventRepresentation[] = [];
  selectedEvent: EventRepresentation | null = null;

  allActivePlayers: PlayerRepresentation[] = [];
  rosterPlayers: PlayerRepresentation[] = [];
  availablePlayers: PlayerRepresentation[] = [];
  playerSearch = '';
  selectedAvailable: Set<number> = new Set();

  groups: TeeGroup[] = [];
  unassignedPlayers: PlayerRepresentation[] = [];
  generating = false;
  showRegenerateWarning = false;

  saving = false;
  statusChanging = false;

  constructor(private service: PlayerService, private authService: AuthService) {}

  ngOnInit() {
    this.authService.getStatus().subscribe(s => { this.isLoggedIn = s.loggedIn; });
    this.service.getAllEvent().subscribe((events: EventRepresentation[]) => {
      this.events = (events || []).filter((e: EventRepresentation) => e.status === 'INIT' || e.status === 'STARTED');
    });
    this.service.getAllPlayer().subscribe(players => {
      this.allActivePlayers = (players || []).filter(p => p.isActive);
    });
  }

  // ── Step 1: Event selection ───────────────────────────────────────────────

  selectEvent(event: EventRepresentation) {
    this.selectedEvent = event;
    this.groups = [];
    if (!this.isLoggedIn) {
      this.step = 3;
      this.loadGroups();
    } else {
      this.step = 2;
      this.loadRoster();
    }
  }

  // ── Step 2: Roster ────────────────────────────────────────────────────────

  loadRoster() {
    if (!this.selectedEvent?.id) return;
    this.service.getRosterPlayers(this.selectedEvent.id).subscribe(roster => {
      this.rosterPlayers = roster || [];
      this.refreshAvailable();
    });
  }

  refreshAvailable() {
    const rosterIds = new Set(this.rosterPlayers.map(p => p.id!));
    this.availablePlayers = this.allActivePlayers.filter(p => !rosterIds.has(p.id!));
    this.selectedAvailable.clear();
  }

  get filteredAvailable() {
    const q = this.playerSearch.toLowerCase();
    return this.availablePlayers.filter(p =>
      `${p.fName} ${p.lName}`.toLowerCase().includes(q) ||
      (p.chineseNickName || '').toLowerCase().includes(q)
    );
  }

  toggleAvailable(id: number) {
    if (this.selectedAvailable.has(id)) this.selectedAvailable.delete(id);
    else this.selectedAvailable.add(id);
  }

  addSelected() {
    if (!this.selectedEvent?.id || this.selectedAvailable.size === 0) return;
    const ids = Array.from(this.selectedAvailable);
    this.service.addPlayersToRoster(this.selectedEvent.id, ids).subscribe(() => this.loadRoster());
  }

  removeFromRoster(player: PlayerRepresentation) {
    if (!this.selectedEvent?.id) return;
    this.service.removePlayerFromRoster(this.selectedEvent.id, player.id!).subscribe(() => this.loadRoster());
  }

  goToStep3() {
    this.step = 3;
    this.loadGroups();
  }

  // ── Step 3: Groups ────────────────────────────────────────────────────────

  loadGroups() {
    if (!this.selectedEvent?.id) return;
    this.service.getGroups(this.selectedEvent.id).subscribe(groups => {
      this.groups = this.mapGroups(groups);
    });
    if (this.isLoggedIn) this.loadUnassigned();
  }

  loadUnassigned() {
    if (!this.selectedEvent?.id) return;
    this.service.getUnassignedPlayers(this.selectedEvent.id).subscribe(players => {
      this.unassignedPlayers = players || [];
    });
  }

  removePlayerFromTee(player: TeePlayer) {
    this.service.removePlayerFromTee(player.playerScoreId).subscribe(() => this.loadGroups());
  }

  removeTee(group: TeeGroup) {
    this.service.deleteTee(group.teeId).subscribe(() => this.loadGroups());
  }

  assignPlayer(player: PlayerRepresentation) {
    if (!this.selectedEvent?.id) return;
    this.service.assignPlayer(this.selectedEvent.id, player.id!).subscribe(() => this.loadGroups());
  }

  clearGroups() {
    if (!this.selectedEvent?.id) return;
    this.service.clearGroups(this.selectedEvent.id).subscribe(() => {
      this.groups = [];
    });
  }

  generateGroups() {
    if (this.groups.length > 0) { this.showRegenerateWarning = true; return; }
    this.doGenerate();
  }

  confirmRegenerate() {
    this.showRegenerateWarning = false;
    this.doGenerate();
  }

  doGenerate() {
    if (!this.selectedEvent?.id) return;
    this.generating = true;
    this.service.generateGroups(this.selectedEvent.id, this.selectedStrategy).subscribe({
      next: () => { this.loadGroups(); this.generating = false; },
      error: () => { this.generating = false; }
    });
  }

  mapGroups(raw: any[]): TeeGroup[] {
    const groups = (raw || []).map(g => ({
      teeId: g.teeId,
      teeName: g.teeName,
      teeTime: g.teeTime || '',
      players: g.players || [],
      editingName: false,
      editingTime: false,
    }));
    return this.sortGroups(groups);
  }

  private parseTeeTime(t: string): number {
    if (!t) return Infinity;
    const m = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!m) return Infinity;
    let h = parseInt(m[1]), min = parseInt(m[2]);
    const ap = (m[3] || '').toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  }

  private sortGroups(groups: TeeGroup[]): TeeGroup[] {
    return groups.sort((a, b) => {
      const ta = this.parseTeeTime(a.teeTime), tb = this.parseTeeTime(b.teeTime);
      if (ta !== tb) return ta - tb;
      return a.teeName.localeCompare(b.teeName);
    });
  }

  saveTee(group: TeeGroup) {
    this.service.updateTee(group.teeId, { teeName: group.teeName, teeTime: group.teeTime }).subscribe(() => {
      group.editingName = false;
      group.editingTime = false;
      this.groups = this.sortGroups([...this.groups]);
    });
  }

  movePlayer(player: TeePlayer, targetTeeId: number) {
    this.service.movePlayerToGroup(player.playerScoreId, targetTeeId).subscribe(() => this.loadGroups());
  }

  // ── Event status ──────────────────────────────────────────────────────────

  advanceStatus(status: string) {
    if (!this.selectedEvent?.id) return;
    this.statusChanging = true;
    this.service.updateEventStatus(this.selectedEvent.id, status).subscribe({
      next: () => {
        this.selectedEvent!.status = status;
        this.statusChanging = false;
      },
      error: () => { this.statusChanging = false; }
    });
  }

  statusColor(status: string | undefined) {
    switch (status) {
      case 'INIT':    return 'accent';
      case 'STARTED': return 'primary';
      case 'FINISHED': return 'warn';
      default: return '';
    }
  }

  // ── Course management ─────────────────────────────────────────────────────

  courses: CourseRepresentation[] = [];
  editingCourse: CourseRepresentation | null = null;
  isNewCourse = false;

  loadCourses() {
    this.service.getCourses().subscribe(c => { this.courses = c || []; });
  }

  openNewCourse() {
    this.editingCourse = {};
    this.isNewCourse = true;
  }

  editCourse(c: CourseRepresentation) {
    this.editingCourse = { ...c };
    this.isNewCourse = false;
  }

  saveCourse() {
    if (!this.editingCourse) return;
    const save$ = this.isNewCourse
      ? this.service.createCourse(this.editingCourse)
      : this.service.updateCourse(this.editingCourse.id!, this.editingCourse);
    save$.subscribe(() => { this.editingCourse = null; this.loadCourses(); });
  }

  deleteCourse(id: number) {
    if (!confirm('Delete this course?')) return;
    this.service.deleteCourse(id).subscribe(() => this.loadCourses());
  }

  cancelCourseEdit() { this.editingCourse = null; }
}
