import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { PlayerRepresentation } from '../../services/api/models/player-representation';
import { MatDialog } from '@angular/material/dialog';
import { ScoreHistoryComponent } from '../score-history/score-history.component';
import { PopupComponent } from '../popup/popup.component';
import { GhinSyncComponent } from '../ghin-sync/ghin-sync.component';
import { EditPlayerComponent } from '../edit-player/edit-player.component';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import 'ag-grid-enterprise';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

  /** Everything the server sent, including inactive players. */
  allPlayers: PlayerRepresentation[] = [];

  /** PGC members by default; the toggle widens it. */
  view: 'member' | 'active' | 'all' = 'member';
  private gridApi!: GridApi<any>;

  colDefs: ColDef[] = [
    { field: 'fName',       headerName: 'First Name',   flex: 4, filter: true },
    { field: 'lName',       headerName: 'Last Name',    flex: 4, filter: true },
    { field: 'pgcHandicap', headerName: 'PGC Handicap', flex: 3, filter: true },
    { field: 'handicap',    headerName: 'Handicap',     flex: 3, filter: true, type: 'numericColumn' },
    { field: 'pgc2025', headerName: 'PGC Member', flex: 3, filter: true,
      valueFormatter: (p: any) => p.value ? 'Yes' : 'No' }
  ];

  defaultColDef = { flex: 10, minWidth: 20 };

  constructor(
    private service: PlayerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.service.getAllPlayer(true).subscribe({
      next: result => { this.allPlayers = result; },
      error: err => {
        if (err.status === 0) window.location.href = 'https://shiyuan.club/oauth2/authorization/cognito';
      }
    });
  }

  /** The rows the grid shows, per the selected view. */
  get players(): PlayerRepresentation[] {
    if (this.view === 'all') { return this.allPlayers; }
    if (this.view === 'active') { return this.allPlayers.filter(p => p.isActive); }
    // "PGC member" means the membership flag is actually set, not merely not-false:
    // 21 players have it null, and null is not a member.
    return this.allPlayers.filter(p => p.pgc2025 === true);
  }

  countFor(view: 'member' | 'active' | 'all'): number {
    if (view === 'all') { return this.allPlayers.length; }
    if (view === 'active') { return this.allPlayers.filter(p => p.isActive).length; }
    return this.allPlayers.filter(p => p.pgc2025 === true).length;
  }

  setView(view: 'member' | 'active' | 'all') {
    this.view = view;
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onRowClicked(event: RowClickedEvent) { this.openEditPlayer(event.data?.id); }

  openEditPlayer(playerId: any) {
    const ref = this.dialog.open(EditPlayerComponent, {
      width: '680px',
      maxWidth: '96vw',
      maxHeight: '90vh',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      disableClose: false,
      data: { title: 'Edit player', userId: playerId }
    });
    ref.afterClosed().subscribe(result => {
      this.service.getAllPlayer(true).subscribe({ next: r => { this.allPlayers = r; } });
      if (result?.showScoreHistory && result.playerId) {
        this.openScoreHistory(result.playerId);
      }
    });
  }

  openScoreHistory(playerId: number) {
    const ref = this.dialog.open(ScoreHistoryComponent, {
      width: '1180px',
      maxWidth: '96vw',
      maxHeight: '90vh',
      data: { playerId, returnToProfile: true }
    });
    // The profile dialog closed to let this one open, so going back means reopening it.
    ref.afterClosed().subscribe(result => {
      if (result?.backToProfile && result.playerId) {
        this.openEditPlayer(result.playerId);
      }
    });
  }

  onAddUserClick() {
    const ref = this.dialog.open(PopupComponent, {
      width: '70%',
      maxWidth: '96vw',
      height: '600px',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      disableClose: true,
      data: { title: 'Player @ Shi Yuan Club in Forsgate' }
    });
    ref.afterClosed().subscribe(() => {
      this.service.getAllPlayer(true).subscribe({ next: r => { this.allPlayers = r; } });
    });
  }

  onGhinSyncClick() {
    const ref = this.dialog.open(GhinSyncComponent, {
      width: '80%',
      maxWidth: '96vw',
      height: '300px',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      disableClose: true,
      data: { title: 'Updating all players handicap' }
    });
    ref.afterClosed().subscribe(() => {
      this.service.getAllPlayer(true).subscribe({ next: r => { this.allPlayers = r; } });
    });
  }
}
