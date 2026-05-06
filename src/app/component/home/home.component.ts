import { Component, OnInit , Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from 'src/app/services/player.service';

import {
  ColDef,
  ColGroupDef,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
  GridOptions
} from 'ag-grid-community';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  
  editdata: any;

  rewardData: any;

  playerScoreData: any;

  rewardData_open: any;

  playerScoreData_open: any;

  constructor(private service: PlayerService) {

  }

  ngOnInit(): void {
    this.service.getOngoingEvent().subscribe(item => {
      this.editdata = item;
      console.log('event==='+this.editdata);
    });
    
    this.service.getLatestRewards('1144').subscribe(item => {
      this.rewardData = item;
      console.log('reward==='+this.rewardData);
    });

    this.service.getLatestPlayerScores('1144').subscribe(item => {
      this.playerScoreData = item;
      console.log('plyaerScoreData==='+this.playerScoreData);
    });

    this.service.getLatestRewards('1145').subscribe(item => {
      this.rewardData_open = item;
      console.log('reward==='+this.rewardData);
    });

    this.service.getLatestPlayerScores('1145').subscribe(item => {
      this.playerScoreData_open = item;
      console.log('plyaerScoreData==='+this.playerScoreData);
    });

  }

    rewardColDefs: ColDef[] = [
      //{ field: "id", headerName: 'Reward ID', flex:5, filter: true},
      { field: "rewardName", headerName: 'Reward Name', flex:5,  filter: true },
      { field: "player.fName", headerName: 'First Name' , flex:5, filter: true },
      { field: "player.lName", headerName: 'Last Name' , flex:5, filter: true },
      { field: "player.nickName", headerName: 'WeChat Name' , flex:5, filter: true },
      { field: "rewardDesc", headerName: 'Reward Desc', flex:5,  filter: true },
     
      //{ field: "rewardStory", headerName: 'Story' , flex:5, filter: true },
      
   
  
  
     // { field: "icon", headerName: 'Picture', cellRenderer: (params:any) => `<img style="height: 680px; width: 680px" src=http://localhost:8080${params.value} />`}
    ];
  
    rewardDefaultColDef = {
      flex:10,
      minWidth:20
    }

    playerScoreColDefs: ColDef[] = [
      //{ field: "id", headerName: 'Reward ID', flex:5, filter: true},
      {headerName: "Ranking",valueGetter: "node.rowIndex + 1", flex:2, filter: true},
      { field: "player.fName", headerName: 'First Name' , flex:4, filter: true },
      { field: "player.lName", headerName: 'Last Name' , flex:4, filter: true },
      { field: "flight", headerName: 'Flight' , flex:2, filter: true },
      { field: "score", headerName: 'Score' , flex:2, filter: true },
      { field: "netScore", headerName: 'Net Score', flex:3,  filter: true },
     
      //{ field: "rewardStory", headerName: 'Story' , flex:5, filter: true },
      
   
  
  
     // { field: "icon", headerName: 'Picture', cellRenderer: (params:any) => `<img style="height: 680px; width: 680px" src=http://localhost:8080${params.value} />`}
    ];
  
    playerScoreDefaultColDef = {
      flex:10,
      minWidth:20
    }
  

  show() {
    let image = document.getElementById("image");
   
 
  }



}
