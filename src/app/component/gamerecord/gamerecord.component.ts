import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

import { PlayerService } from 'src/app/services/player.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventRepresentation } from 'src/app/services/api/models/event-representation';
import { CourseRepresentation } from 'src/app/services/api/models/course-representation';
import { TournamentRepresentation } from 'src/app/services/api/models/tournament-representation';
import { EventDialogComponent } from './event-dialog.component';
import { ConfirmDeleteDialogComponent } from '../donation/confirm-delete-dialog.component';
import { ScoreDetailModalComponent } from './score-detail-modal.component';

@Component({
  selector: 'app-gamerecord',
  templateUrl: './gamerecord.component.html',
  styleUrls: ['./gamerecord.component.css'],
})
export class GamerecordComponent implements OnInit {

  isLoggedIn = false;
  events: EventRepresentation[] = [];

  // ── Hierarchical grid data ────────────────────────────────────────────────

  gridRows: Array<{
    isTournament: boolean;
    tournament?: TournamentRepresentation;
    tournamentEvents?: EventRepresentation[];
    event?: EventRepresentation;
  }> = [];

  // ── Tournament management ─────────────────────────────────────────────────

  tournaments: TournamentRepresentation[] = [];
  editingTournament: TournamentRepresentation | null = null;
  isNewTournament = false;
  unlinkedEvents: EventRepresentation[] = [];
  courses: CourseRepresentation[] = [];
  seasons: any[] = [];
  newEventForms: { [tournamentId: number]: Partial<EventRepresentation> } = {};

  constructor(
    private service: PlayerService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.getStatus().subscribe(s => { this.isLoggedIn = s.loggedIn; });
    this.loadAll();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadAll() {
    forkJoin([
      this.service.getAllEvent(),
      this.service.getTournaments()
    ]).subscribe(([events, tournaments]) => {
      this.events = events || [];
      this.tournaments = tournaments || [];
      this.buildGridData();
    });
  }

  private buildGridData() {
    const byTournament = new Map<number, EventRepresentation[]>();
    const standalone: EventRepresentation[] = [];

    for (const e of this.events) {
      if (e.tournamentId) {
        if (!byTournament.has(e.tournamentId)) byTournament.set(e.tournamentId, []);
        byTournament.get(e.tournamentId)!.push(e);
      } else {
        standalone.push(e);
      }
    }

    const rows: typeof this.gridRows = [];

    for (const t of this.tournaments) {
      const tournamentEvents = (byTournament.get(t.id!) || []).sort((a, b) =>
        (a.eventDate ?? '').localeCompare(b.eventDate ?? ''));
      // Representative date: latest event date, falling back to tournament dates
      const sortDate = tournamentEvents.length > 0
        ? tournamentEvents[tournamentEvents.length - 1].eventDate ?? ''
        : (t.endDate ?? t.startDate ?? '');
      rows.push({ isTournament: true, tournament: t, tournamentEvents, event: { eventDate: sortDate } });
    }

    for (const e of standalone) {
      rows.push({ isTournament: false, event: e });
    }

    // Sort strictly by representative date descending — latest on top
    rows.sort((a, b) =>
      (b.event?.eventDate ?? '').localeCompare(a.event?.eventDate ?? ''));

    this.gridRows = rows;
    this.unlinkedEvents = this.events.filter(e => !e.tournamentId);
  }

  // ── Event actions ─────────────────────────────────────────────────────────

  openAddDialog() {
    this.openEditDialog(undefined);
  }

  openEditDialog(event?: EventRepresentation) {
    const ref = this.dialog.open(EventDialogComponent, {
      width: '500px',
      data: { event }
    });
    ref.afterClosed().subscribe((result: EventRepresentation | undefined) => {
      if (!result) return;
      if (result.id) {
        this.service.updateEvent(result.id, result).subscribe({
          next: () => this.loadAll(),
          error: err => console.error('Update failed', err)
        });
      } else {
        this.service.createEvent(result).subscribe({
          next: () => this.loadAll(),
          error: err => console.error('Create failed', err)
        });
      }
    });
  }

  deleteEvent(event: EventRepresentation) {
    const name = event.eventName ?? `ID ${event.id}`;
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { name }
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.service.deleteEvent(event.id!).subscribe({
        next: () => this.loadAll(),
        error: err => console.error('Delete failed', err)
      });
    });
  }

  statusColor(status: string | undefined) {
    switch (status) {
      case 'INIT':     return 'accent';
      case 'STARTED':  return 'primary';
      case 'FINISHED': return 'warn';
      default: return '';
    }
  }

  isLocked(status: string | undefined) {
    return status === 'FINISHED' || status === 'CLOSED';
  }

  isAllFinished(events: EventRepresentation[]): boolean {
    return events.length > 0 && events.every(e => e.status === 'FINISHED' || e.status === 'CLOSED');
  }

  openEventScoreModal(event: EventRepresentation) {
    this.service.getEventScoreDetail(event.id!).subscribe(detail => {
      this.dialog.open(ScoreDetailModalComponent, {
        width: '95vw', maxWidth: '1400px',
        data: { title: event.eventName ?? 'Score Detail', games: [detail] }
      });
    });
  }

  openTournamentScoreModal(tournament: TournamentRepresentation) {
    this.service.getTournamentScoreDetails(tournament.id!).subscribe(games => {
      this.dialog.open(ScoreDetailModalComponent, {
        width: '95vw', maxWidth: '1400px',
        data: { title: tournament.name ?? 'Tournament Scores', games }
      });
    });
  }

  // ── Tournament management ─────────────────────────────────────────────────

  loadSeasons() {
    this.service.getSeasons().subscribe(s => { this.seasons = s || []; });
  }

  loadCourses() {
    this.service.getCourses().subscribe(c => { this.courses = c || []; });
  }

  openNewTournament() {
    this.editingTournament = {};
    this.isNewTournament = true;
  }

  editTournament(t: TournamentRepresentation) {
    this.editingTournament = { ...t, events: undefined };
    this.isNewTournament = false;
  }

  saveTournament() {
    if (!this.editingTournament) return;
    const op$ = this.isNewTournament
      ? this.service.createTournament(this.editingTournament)
      : this.service.updateTournament(this.editingTournament.id!, this.editingTournament);
    op$.subscribe(() => { this.editingTournament = null; this.loadAll(); });
  }

  cancelTournamentEdit() { this.editingTournament = null; }

  deleteTournament(t: TournamentRepresentation) {
    if (!confirm(`Delete tournament "${t.name}"? Events will be unlinked but not deleted.`)) return;
    this.service.deleteTournament(t.id!).subscribe(() => this.loadAll());
  }

  addEventToTournament(tournamentId: number, eventId: number) {
    this.service.addEventToTournament(tournamentId, eventId).subscribe(() => this.loadAll());
  }

  removeEventFromTournament(tournamentId: number, eventId: number) {
    this.service.removeEventFromTournament(tournamentId, eventId).subscribe(() => this.loadAll());
  }

  openNewEventForTournament(tournamentId: number) {
    this.newEventForms[tournamentId] = { status: 'INIT' };
  }

  cancelNewEventForm(tournamentId: number) {
    delete this.newEventForms[tournamentId];
  }

  saveNewEventForTournament(tournamentId: number) {
    const form = this.newEventForms[tournamentId];
    if (!form?.eventName || !form?.eventDate) return;
    this.service.createEventUnderTournament(tournamentId, form).subscribe(() => {
      delete this.newEventForms[tournamentId];
      this.loadAll();
    });
  }
}
