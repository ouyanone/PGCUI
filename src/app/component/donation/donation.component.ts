import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColDef, CellClickedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-enterprise';

import { PlayerService } from 'src/app/services/player.service';
import { AuthService } from 'src/app/services/auth.service';
import { DonationRepresentation } from 'src/app/services/api/models/donation-representation';
import { DonationDialogComponent } from './donation-dialog.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.css']
})
export class DonationComponent implements OnInit {

  donations: DonationRepresentation[] = [];
  isLoggedIn = false;
  private gridApi!: GridApi;

  colDefs: ColDef[] = [
    { field: 'donationName', headerName: 'Name',        minWidth: 150, filter: true, wrapText: false },
    { field: 'donationDesc', headerName: 'Description', minWidth: 200, filter: true, wrapText: false },
    { field: 'donationDate', headerName: 'Date',        minWidth: 120, filter: true, wrapText: false },
    { field: 'amount',       headerName: 'Amount ($)',  minWidth: 110, filter: true, wrapText: false },
    {
      headerName: 'Player',
      minWidth: 150,
      filter: true,
      wrapText: false,
      valueGetter: (p: any) =>
        p.data?.player
          ? `${p.data.player.fName ?? ''} ${p.data.player.lName ?? ''}`.trim()
          : ''
    },
    {
      headerName: 'Actions',
      minWidth: 150,
      sortable: false,
      filter: false,
      hide: true,
      cellRenderer: () =>
        `<button class="pgc-btn-edit">Edit</button>` +
        `<button class="pgc-btn-delete">Delete</button>`
    }
  ];

  defaultColDef: ColDef = { minWidth: 80, wrapText: false, autoHeight: false };

  constructor(
    private service: PlayerService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.getStatus().subscribe(s => {
      this.isLoggedIn = s.loggedIn;
      this.updateActionsCol();
    });
    this.loadDonations();
  }

  private updateActionsCol() {
    const col = this.colDefs.find(c => c.headerName === 'Actions');
    if (col) col.hide = !this.isLoggedIn;
    this.gridApi?.setGridOption('columnDefs', this.colDefs);
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.updateActionsCol();
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

  private openDialog(donation?: DonationRepresentation) {
    const ref = this.dialog.open(DonationDialogComponent, {
      width: '480px',
      data: { donation }
    });
    ref.afterClosed().subscribe((result: DonationRepresentation | undefined) => {
      if (!result) return;
      if (result.id) {
        this.service.updateDonation(result.id, result).subscribe({
          next: () => this.loadDonations(),
          error: err => console.error('Update failed', err)
        });
      } else {
        this.service.createDonation(result).subscribe({
          next: () => this.loadDonations(),
          error: err => console.error('Create failed', err)
        });
      }
    });
  }

  private confirmDelete(donation: DonationRepresentation) {
    const name = donation.donationName ?? `ID ${donation.id}`;
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { name }
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.service.deleteDonation(donation.id!).subscribe({
        next: () => this.loadDonations(),
        error: err => console.error('Delete failed', err)
      });
    });
  }

  private loadDonations() {
    this.service.getDonations().subscribe({
      next: result => { this.donations = result; },
      error: err => console.error('Load failed', err)
    });
  }
}
