import { Component } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Router } from '@angular/router';

import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  ColGroupDef,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
  GridOptions
} from 'ag-grid-community';
import 'ag-grid-enterprise';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DonationRepresentation } from 'src/app/services/api/models/donation-representation';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';



@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.css']
})
export class DonationComponent {

  constructor(
    private service: PlayerService
  ) {

  }


  donations: DonationRepresentation[] = [];


  colDefs: ColDef[] = [
    { field: "id", headerName: 'Doantion ID', flex:5, filter: true},
    { field: "donationName", headerName: 'Donation Name', flex:5,  filter: true },
    { field: "donationDesc", headerName: 'Donation Desc', flex:5,  filter: true },
    { field: "donor", headerName: 'Donor' , flex:5, filter: true },
    { field: "cash", headerName: 'Cash' , flex:5, filter: true },
    { field: "product", headerName: 'Product' , flex:5, filter: true },
    { field: "donationDate", headerName: 'Donation Date' , flex:5, filter: true }


   // { field: "icon", headerName: 'Picture', cellRenderer: (params:any) => `<img style="height: 680px; width: 680px" src=http://localhost:8080${params.value} />`}
  ];

  defaultColDef = {
    flex:10,
    minWidth:20
  }


  ngOnInit(): void {
    this.service.getDonations()
    .subscribe({
      next: (result) => {
        this.donations = result;

      },
      error: (error) => {
        // Handle errors if any
        console.error('error=', error.status);
        if (error.status==0) {
          window.location.href = 'https://shiyuan.club/oauth2/authorization/cognito';
        }
        
      }
    });

  }


}
