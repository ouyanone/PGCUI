import { Component, OnInit, Inject } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import {PlayerRepresentation} from "../../services/api/models/player-representation";
import {Router} from "@angular/router";
import {PopupComponent} from '../popup/popup.component'


import { AgGridAngular } from 'ag-grid-angular';
import { AgGridModule } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
} from 'ag-grid-community';
import 'ag-grid-enterprise';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GhinSyncComponent } from '../ghin-sync/ghin-sync.component';
import { syncBuiltinESMExports } from 'module';
import { EditPlayerComponent } from '../edit-player/edit-player.component';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})


export class PlayerComponent implements OnInit{


  private gridApi!: GridApi<any>;


  players: Array<PlayerRepresentation> = [];

  rowStyle :  any;




  colDefs: ColDef[] = [
    { field: 'fName',       headerName: 'First Name',    flex: 4, filter: true },
    { field: 'lName',       headerName: 'Last Name',     flex: 4, filter: true },
    { field: 'pgcHandicap', headerName: 'PGC Handicap',  flex: 3, filter: true },
    { field: 'handicap',    headerName: 'Handicap',      flex: 3, filter: true, type: 'numericColumn' },
    {
      field: 'pgc2025',
      headerName: 'PGC Member',
      flex: 3,
      filter: true,
      valueFormatter: (p: any) => p.value ? 'Yes' : 'No'
    }
  ];

  defaultColDef = {
    flex:10,
    minWidth:20
  }


  constructor(
    private service: PlayerService,
    private router: Router,
    private dialog: MatDialog
  ) {

  }



  ngOnInit(): void {
    this.service.getAllPlayer()
    .subscribe({
      next: (result) => {
        this.players = result;

      },
      error: (error) => {
        // Handle errors if any
        console.log('dddddddd');
        console.error('error=', error.status);
        if (error.status==0) {
          window.location.href = 'https://shiyuan.club/oauth2/authorization/cognito';
        }
        
      }
    });

 
   

  }

  onAddUserClick() {
    var _popup = this.dialog.open(PopupComponent, {
      width: '70%',
      height: '600px',
      enterAnimationDuration:'1500ms',
      exitAnimationDuration:'1500ms',
      disableClose:true,
      data: {
        title: 'Player @ Shi Yuan Club in Forsgate'
      }
    });
    _popup.afterClosed().subscribe(item=>{
      this.service.getAllPlayer()
      .subscribe({
        next: (result) => {
          this.players = result;

        }
      });
    }) ;

  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();

  }


  onGhinSyncClick() {
    console.log("in ghin sync...");
    var _popup = this.dialog.open(GhinSyncComponent, {
      width: '80%',
      height: '300px',
      enterAnimationDuration:'1500ms',
      exitAnimationDuration:'1500ms',
      disableClose:true,
      data: {
        title: 'Updating all players handicap'
      }
    });

    _popup.afterClosed().subscribe(item=>{
      this.service.getAllPlayer()
      .subscribe({
        next: (result) => {
          this.players = result;

        }
      });
    }) ;
  }

  onUpdateLast3() {
    console.log("in  onUpdateLast3...");
    this.service.updateLast3Score().subscribe(res => {
      console.log("finished calling update last 3 score function.");
      this.service.getAllPlayer()
      .subscribe({
        next: (result) => {
          this.players = result;

        }
      });

    });
  }

onRowClicked(event: RowClickedEvent) {
  this.openEditPlayer(event.data.id);
}

openEditPlayer(playerId: any) {
  var _popup = this.dialog.open(EditPlayerComponent, {
    width: '680px',
    maxHeight: '90vh',
    enterAnimationDuration: '300ms',
    exitAnimationDuration: '200ms',
    disableClose: false,
    data: {
      title: 'Edit player',
      userId: playerId
    }
  });

  _popup.afterClosed().subscribe(item=>{
    this.service.getAllPlayer()
    .subscribe({
      next: (result) => {
        this.players = result;

      }
    });
  }) ;
}


}


