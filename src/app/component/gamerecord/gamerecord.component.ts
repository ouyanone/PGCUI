import { Component, OnInit } from '@angular/core';
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
import { EventRepresentation } from 'src/app/services/api/models/event-representation';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { GameinputComponent } from 'src/app/component/gameinput/gameinput.component';

@Component({
  selector: 'app-gamerecord',
  templateUrl: './gamerecord.component.html',
  styleUrls: ['./gamerecord.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*', minHeight: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class GamerecordComponent implements OnInit{

  events: EventRepresentation[] = [];

  constructor(
    private service: PlayerService,
    private router: Router,
    private dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    this.service.getAllEvent()
    .subscribe({
      next: (result) => {
        this.events = result;

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

  colDefs: ColDef[] = [
    { field: "id", headerName: 'Event ID', flex:5, onCellClicked: (event: CellClickedEvent) => this.openGameRecord(event) },
    { field: "eventName", headerName: 'Event Name', flex:5,  filter: true },
    { field: "eventDate", headerName: 'Event date' , flex:5, filter: true },
    { field: "status", headerName: 'Status' , flex:5, filter: true }


   // { field: "icon", headerName: 'Picture', cellRenderer: (params:any) => `<img style="height: 680px; width: 680px" src=http://localhost:8080${params.value} />`}
  ];

  defaultColDef = {
    flex:10,
    minWidth:20
  }

  openGameRecord(event:CellClickedEvent) {
    console.log("edit game record is clicked"+event.value);

    var _popup = this.dialog.open(GameinputComponent, {
      width: '70%',
      height: '1200px',
      enterAnimationDuration:'1500ms',
      exitAnimationDuration:'1500ms',
      disableClose:true,
      data: {
        title: 'Edit Event',
        eventId: event.value
      }
    });

    _popup.afterClosed().subscribe(item=>{
      this.service.getAllEvent()
      .subscribe({
        next: (result) => {
          this.events = result;

        }
      });
    }) ;

  }




}


