import { Component, OnInit, Inject } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import {PlayerRepresentation} from "../../services/api/models/player-representation";
import {Router} from "@angular/router";
import {PopupComponent} from '../popup/popup.component'


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
    { field: "id", headerName: 'Golfer ID', flex:5, onCellClicked: (event: CellClickedEvent) => this.openEditPlayer(event) },
    { field: "fName", headerName: 'First Name', flex:5,  filter: true },
    { field: "lName", headerName: 'Last Name' , flex:5, filter: true },
    { field: "ghinNumber", headerName: 'ghin Number',  flex:5 },
    { field: "phone", headerName: 'Phone Number',  flex:6 },
    { field: "email", headerName: 'Email',  flex:7 },
    { field: "nickName", headerName: 'Nick Name',  flex:5 },
    { field: "chineseNickName", headerName: 'Chinese Nick Name',  flex:7 },
    { field: "handicap", headerName: 'Handicap', type: 'numericColumn', flex:4, filter: true  },
    { field: "clubId", headerName: 'Club ID',  flex:4 },
    { field: "clubName", headerName: 'Club Name', flex:12, filter: true  },
    { field: "last3GameAvg", headerName: 'last3GameAvg', flex:12, filter: true  }
   // { field: "icon", headerName: 'Picture', cellRenderer: (params:any) => `<img style="height: 680px; width: 680px" src=http://localhost:8080${params.value} />`}
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

openEditPlayer(event:CellClickedEvent) {
  console.log("edit player is clicked"+event.value);

  var _popup = this.dialog.open(EditPlayerComponent, {
    width: '60%',
    height: '800px',
    enterAnimationDuration:'1500ms',
    exitAnimationDuration:'1500ms',
    disableClose:true,
    data: {
      title: 'Edit player',
      userId: event.value
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


