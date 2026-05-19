import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColDef, CellClickedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-enterprise';

import { PlayerService } from 'src/app/services/player.service';
import { RewardRepresentation } from 'src/app/services/api/models/reward-representation';
import { RewardDialogComponent } from './reward-dialog.component';
import { ConfirmDeleteDialogComponent } from '../donation/confirm-delete-dialog.component';

@Component({
  selector: 'app-reward',
  templateUrl: './reward.component.html',
  styleUrls: ['./reward.component.css']
})
export class RewardComponent implements OnInit {

  rewards: RewardRepresentation[] = [];
  private gridApi!: GridApi;

  colDefs: ColDef[] = [
    {
      field: 'event.eventName',
      headerName: 'Game',
      rowGroup: true,
      hide: true
    },
    { field: 'displayOrder', headerName: 'Order',       width: 80,  filter: true },
    { field: 'rewardName',   headerName: 'Award Name',  flex: 3,    filter: true },
    { field: 'rewardDesc',   headerName: 'Description', flex: 3,    filter: true },
    { field: 'rewardStory',  headerName: 'Story',       flex: 4,    filter: true },
    {
      headerName: 'Winner',
      flex: 2,
      filter: true,
      valueGetter: (p: any) =>
        p.data?.player
          ? `${p.data.player.fName ?? ''} ${p.data.player.lName ?? ''}`.trim()
          : ''
    },
    {
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filter: false,
      cellRenderer: () =>
        `<button class="pgc-btn-edit">Edit</button>` +
        `<button class="pgc-btn-delete">Delete</button>`
    }
  ];

  defaultColDef: ColDef = { minWidth: 80 };

  autoGroupColDef: ColDef = {
    headerName: 'Game',
    minWidth: 220,
    cellRendererParams: { suppressCount: true }
  };

  constructor(private service: PlayerService, private dialog: MatDialog) {}

  ngOnInit() { this.loadRewards(); }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.expandAll();
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

  openAddDialog() { this.openDialog(undefined); }

  private openDialog(reward?: RewardRepresentation) {
    const ref = this.dialog.open(RewardDialogComponent, {
      width: '520px',
      data: { reward }
    });
    ref.afterClosed().subscribe((result: RewardRepresentation | undefined) => {
      if (!result) return;
      if (result.id) {
        this.service.updateReward(result.id, result).subscribe({
          next: () => this.loadRewards(),
          error: err => console.error('Update failed', err)
        });
      } else {
        this.service.createReward(result).subscribe({
          next: () => this.loadRewards(),
          error: err => console.error('Create failed', err)
        });
      }
    });
  }

  private confirmDelete(reward: RewardRepresentation) {
    const name = reward.rewardName ?? `ID ${reward.id}`;
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { name }
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.service.deleteReward(reward.id!).subscribe({
        next: () => this.loadRewards(),
        error: err => console.error('Delete failed', err)
      });
    });
  }

  private loadRewards() {
    this.service.getAllRewards().subscribe({
      next: result => {
        this.rewards = result;
        setTimeout(() => this.gridApi?.expandAll(), 0);
      },
      error: err => console.error('Load failed', err)
    });
  }
}
