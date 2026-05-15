import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColDef, CellClickedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-enterprise';

import { PlayerService } from 'src/app/services/player.service';
import { EventRepresentation } from 'src/app/services/api/models/event-representation';
import { EventDialogComponent } from './event-dialog.component';
import { ConfirmDeleteDialogComponent } from '../donation/confirm-delete-dialog.component';

@Component({
  selector: 'app-gamerecord',
  templateUrl: './gamerecord.component.html',
  styleUrls: ['./gamerecord.component.css'],
})
export class GamerecordComponent implements OnInit {

  events: EventRepresentation[] = [];
  private gridApi!: GridApi;

  colDefs: ColDef[] = [
    { field: 'id',          headerName: 'ID',      flex: 1, filter: true },
    { field: 'eventName',   headerName: 'Name',    flex: 3, filter: true },
    { field: 'eventDate',   headerName: 'Date',    flex: 2, filter: true },
    { field: 'status',      headerName: 'Status',  flex: 2, filter: true },
    {
      headerName: 'Course',
      flex: 3,
      filter: true,
      valueGetter: (p: any) =>
        p.data?.course ? `${p.data.course.clubName ?? ''} — ${p.data.course.courseName ?? ''}` : ''
    },
    {
      headerName: 'Season',
      flex: 2,
      filter: true,
      valueGetter: (p: any) => p.data?.season?.seasonName ?? ''
    },
    {
      headerName: 'Actions',
      flex: 2,
      sortable: false,
      filter: false,
      cellRenderer: (p: any) => {
        const locked = p.data?.status === 'FINISHED' || p.data?.status === 'CLOSED';
        return `<button class="pgc-btn-edit">Edit</button>` +
          (locked ? '' : `<button class="pgc-btn-delete">Delete</button>`);
      }
    }
  ];

  defaultColDef: ColDef = { minWidth: 80 };

  constructor(
    private service: PlayerService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }

  onCellClicked(event: CellClickedEvent) {
    const target = event.event?.target as HTMLElement;
    if (!target) return;
    if (target.classList.contains('pgc-btn-edit')) {
      this.openDialog(event.data);
    } else if (target.classList.contains('pgc-btn-delete')) {
      this.confirmDelete(event.data);
    }
  }

  openAddDialog() {
    this.openDialog(undefined);
  }

  private openDialog(event?: EventRepresentation) {
    const ref = this.dialog.open(EventDialogComponent, {
      width: '500px',
      data: { event }
    });
    ref.afterClosed().subscribe((result: EventRepresentation | undefined) => {
      if (!result) return;
      if (result.id) {
        this.service.updateEvent(result.id, result).subscribe({
          next: () => this.loadEvents(),
          error: err => console.error('Update failed', err)
        });
      } else {
        this.service.createEvent(result).subscribe({
          next: () => this.loadEvents(),
          error: err => console.error('Create failed', err)
        });
      }
    });
  }

  private confirmDelete(event: EventRepresentation) {
    const name = event.eventName ?? `ID ${event.id}`;
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { name }
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.service.deleteEvent(event.id!).subscribe({
        next: () => this.loadEvents(),
        error: err => console.error('Delete failed', err)
      });
    });
  }

  private loadEvents() {
    this.service.getAllEvent().subscribe({
      next: result => { this.events = result; },
      error: err => console.error('Load failed', err)
    });
  }
}
