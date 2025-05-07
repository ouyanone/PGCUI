import { Component, OnInit } from '@angular/core';
import { DualListComponent } from '../../../../node_modules/angular-dual-listbox';
import { PlayerService } from '../../services/player.service';
import { PlayerRepresentation } from '../../services/api/models/player-representation';
import { FormBuilder } from '@angular/forms';
import { EventRepresentation } from '../../services/api/models/event-representation';
import { throwToolbarMixedModesError } from '../../../../node_modules/@angular/material/toolbar';
import { Tee } from 'src/app/services/api/models/tee';
import { MatTabGroup } from '../../../../node_modules/@angular/material/tabs';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-gameplan',
  templateUrl: './gameplan.component.html',
  styleUrls: ['./gameplan.component.css']
})
export class GameplanComponent implements OnInit{

//source = [ 'Pawn', 'Rook', 'Knight', 'Bishop', 'Queen', 'King' ];
//target = [];

constructor(
  private service: PlayerService, private builder: FormBuilder, private router:Router
) {

}
groupingMethod: number=1;
tab = 1;
keepSorted = true;
key: string='';
display: string[]=[];
filter = false;
source: Array<PlayerRepresentation>=[];
confirmed: Array<PlayerRepresentation>=[];
sortedPlayers: Array<PlayerRepresentation>=[];
userAdd = '';
disabled = false;

season: string='2024';
eventName: string='';
eventDesc: string='';
course: string='';
eventNameShow:string='';
eventDate:string='';

totalTeamAHandicap: number = 0;
totalTeamA3Score: number = 0;
totalTeamBHandicap: number = 0;
totalTeamB3Score: number = 0;


isSubmitted = false;

event1: EventRepresentation = new EventRepresentation();


sourceLeft = true;
format: any = DualListComponent.DEFAULT_FORMAT;

private sourcePlayers: Array<PlayerRepresentation>=[];

private confirmedPlayers: Array<PlayerRepresentation>=[];

players: Array<PlayerRepresentation> = [];

numberOfTees: number=1;
totalNumberOfTees: number=0;
teeList: Array<Tee>=[];


ngOnInit() {
this.doReset() ;
this.event1.eventName='test';

}

private usePlayers() {
  this.key = 'id';
  //this.display =   'fName';  // [ 'fName', 'fName' ];
  this.display =   ['fName', 'lName',  'chineseNickName'];
  this.keepSorted = true;
  this.source = this.sourcePlayers;
  this.confirmed = this.confirmedPlayers;

}
doReset() {
console.log('in doreset');

  this.service.getAllPlayer()
  .subscribe({
    next: (result) => {
      this.players = result;
      console.log('players=='+this.players);
      this.sourcePlayers = this.players;
      this.confirmedPlayers = new Array<PlayerRepresentation>();
      this.usePlayers();
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



filterBtn() {
  return (this.filter ? 'Hide Filter' : 'Show Filter');
}

doDisable() {
  this.disabled = !this.disabled;
}

disableBtn() {
  return (this.disabled ? 'Enable' : 'Disabled');
}

swapDirection() {
  this.sourceLeft = !this.sourceLeft;
  this.format.direction = this.sourceLeft ? DualListComponent.LTR : DualListComponent.RTL;
}


dateChanged($event:any) {
  let date: Date = new Date($event.value);
  this.eventName=date.toDateString();
  this.eventDate=date.toDateString();
}

onGroupingSubmit(grouptab: MatTabGroup) {
  this.isSubmitted=true;
  this.event1.player=this.confirmed;
  this.event1.eventName=this.eventName;
  this.event1.eventDesc=this.eventDesc;
  this.event1.course=this.course;
  this.event1.eventDate=this.eventDate;
  this.event1.season=this.season;

  grouptab.selectedIndex=1;

  //this.teeList.length=0;

    this.sortedPlayers = this.confirmed.sort(function(a,b){
    return a.last3GameAvg >b.last3GameAvg?1:a.last3GameAvg <b.last3GameAvg?-1:0
   })

   for (var player of this.sortedPlayers) {
    console.log("player="+player.fName);
  }

  this.numberOfTees = Math.ceil(this.sortedPlayers.length/4);
  console.log("numberOfTees="+this.numberOfTees);




  for(let i=0;i<this.numberOfTees;i++) {
    let tee = new Tee();
    tee.teeName =  (i+1+this.totalNumberOfTees).toString();

      tee.teamA.push(this.sortedPlayers[i*4], this.sortedPlayers[i*4+3]);
      tee.teamB.push(this.sortedPlayers[i*4+1], this.sortedPlayers[i*4+2]);

      var teamAHandicap1 = 0;
      var teamAHandicap2 = 0;

      var teamBHandicap1 = 0;
      var teamBHandicap2 = 0;
      if (this.sortedPlayers[i*4].handicap !==undefined) {
        teamAHandicap1 = this.sortedPlayers[i*4].handicap!;
      }

      if (this.sortedPlayers[i*4+3]!==undefined && this.sortedPlayers[i*4+3].handicap !==undefined) {
        teamAHandicap2 = this.sortedPlayers[i*4+3].handicap!;
      }

      if (this.sortedPlayers[i*4+1]!==undefined  && this.sortedPlayers[i*4+1].handicap !==undefined) {
        teamBHandicap1 = this.sortedPlayers[i*4+1].handicap!;
      }

      if (this.sortedPlayers[i*4+2]!==undefined && this.sortedPlayers[i*4+2].handicap !==undefined) {
        teamBHandicap2 = this.sortedPlayers[i*4+2].handicap!;
      }
      if (teamAHandicap2==0) {
        tee.teamAavghandicap = teamAHandicap1;
      } else {
        tee.teamAavghandicap = (teamAHandicap1 + teamAHandicap2)/2;
      }

      if (teamBHandicap2==0) {
        tee.teamBavghandicap = teamBHandicap1;
      } else {
        tee.teamBavghandicap = (teamBHandicap1 + teamBHandicap2)/2;
      }

//-------------------------------------------------------------------------------------------------------

    var teamA3Score1 = 0;
    var teamA3Score2 = 0;

    var teamB3Score1 = 0;
    var teamB3Score2 = 0;
    if (this.sortedPlayers[i*4].last3GameAvg !==undefined) {
      teamA3Score1 = this.sortedPlayers[i*4].last3GameAvg!;
    }

    if (this.sortedPlayers[i*4+3]!==undefined && this.sortedPlayers[i*4+3].last3GameAvg !==undefined) {
      teamA3Score2 = this.sortedPlayers[i*4+3].last3GameAvg!;
    }

    if (this.sortedPlayers[i*4+1]!==undefined  && this.sortedPlayers[i*4+1].last3GameAvg !==undefined) {
      teamB3Score1 = this.sortedPlayers[i*4+1].last3GameAvg!;
    }

    if (this.sortedPlayers[i*4+2]!==undefined && this.sortedPlayers[i*4+2].last3GameAvg !==undefined) {
      teamB3Score2 = this.sortedPlayers[i*4+2].last3GameAvg!;
    }
    if (teamA3Score2==0) {
      tee.teamAavgScore = teamA3Score1;
    } else {
      tee.teamAavgScore = (teamA3Score1 + teamA3Score2)/2;
    }

    if (teamB3Score2==0) {
      tee.teamBavgScore = teamB3Score1;
    } else {
      tee.teamBavgScore = (teamB3Score1 + teamB3Score2)/2;
    }

    tee.teamAavghandicap=Math.round(tee.teamAavghandicap * 100) / 100;
    tee.teamBavghandicap=Math.round(tee.teamBavghandicap * 100) / 100;

    tee.teamAavgScore=Math.round(tee.teamAavgScore * 100) / 100;
    tee.teamBavgScore=Math.round(tee.teamBavgScore * 100) / 100;

    this.teeList.push(tee);
  }


this.totalTeamAHandicap= 0;
this.totalTeamA3Score = 0;
this.totalTeamBHandicap = 0;
this.totalTeamB3Score = 0;

for (let i=0; i<this.teeList.length; i++) {
  this.totalTeamAHandicap=this.totalTeamAHandicap+this.teeList[i].teamAavghandicap!;
  this.totalTeamBHandicap=this.totalTeamBHandicap+this.teeList[i].teamBavghandicap!;
  this.totalTeamA3Score=this.totalTeamA3Score+this.teeList[i].teamAavgScore!;
  this.totalTeamB3Score=this.totalTeamB3Score+this.teeList[i].teamBavgScore!;
}
this.totalTeamAHandicap=this.totalTeamAHandicap/this.teeList.length;
this.totalTeamBHandicap=this.totalTeamBHandicap/this.teeList.length;
this.totalTeamA3Score=this.totalTeamA3Score/this.teeList.length;
this.totalTeamB3Score=this.totalTeamB3Score/this.teeList.length;



this.totalTeamAHandicap=Math.round(this.totalTeamAHandicap * 100) / 100;
this.totalTeamBHandicap=Math.round(this.totalTeamBHandicap * 100) / 100;

this.totalTeamA3Score=Math.round(this.totalTeamA3Score* 100) / 100;
this.totalTeamB3Score=Math.round(this.totalTeamB3Score * 100) / 100;


  console.log("teeList="+ JSON.stringify(this.teeList, null, 4));




}

eventForm = this.builder.group({
  eventName: this.builder.control(this.eventNameShow),
  eventDesc: this.builder.control('test'),
  season:this.builder.control(''),
  course:this.builder.control(''),
  groupMethod:this.builder.control('')



});


onTabClick(event:any) {
  console.log('event='+event.index);

}

onSubmitGroup() {
  console.log('onSubmitGroup', this.teeList[0]);
  this.event1.teeList=this.teeList;
  this.service.createEventTee(this.event1).subscribe(res => {
    console.log("calling event..."+res);
    this.router.navigate(['gamerecord']);
   // if(res.status == 200){
      //this.router.navigate(['/'])
      //alert(res.status);
    //}
    //else{
      //alert(res.status);
    //}
    console.log("calling event...");
  },

    err => console.log("calling event...err"+err)
  );



}


manualTeeList: Array<Tee>=[];
addTee() {
  console.log("adding tee:"+JSON.stringify(this.confirmed));
  let tee = new Tee();
  tee.teeName =  (this.totalNumberOfTees+1).toString();
  this.totalNumberOfTees=this.totalNumberOfTees+1;
  tee.teamA.push(this.confirmed[0], this.confirmed[1]);
  tee.teamB.push(this.confirmed[2], this.confirmed[3]);


  var teamAHandicap1 = 0;
  var teamAHandicap2 = 0;

  var teamBHandicap1 = 0;
  var teamBHandicap2 = 0;
  if (this.confirmed[0].handicap !==undefined) {
    teamAHandicap1 = this.confirmed[0].handicap!;
  }

  if (this.confirmed[1]!==undefined && this.confirmed[1].handicap !==undefined) {
    teamAHandicap2 = this.confirmed[1].handicap!;
  }

  if (this.confirmed[2]!==undefined  && this.confirmed[2].handicap !==undefined) {
    teamBHandicap1 = this.confirmed[2].handicap!;
  }

  if (this.confirmed[3]!==undefined && this.confirmed[3].handicap !==undefined) {
    teamBHandicap2 = this.confirmed[3].handicap!;
  }
  if (teamAHandicap2==0) {
    tee.teamAavghandicap = teamAHandicap1;
  } else {
    tee.teamAavghandicap = (teamAHandicap1 + teamAHandicap2)/2;
  }

  if (teamBHandicap2==0) {
    tee.teamBavghandicap = teamBHandicap1;
  } else {
    tee.teamBavghandicap = (teamBHandicap1 + teamBHandicap2)/2;
  }

//-------------------------------------------------------------------------------------------------------

var teamA3Score1 = 0;
var teamA3Score2 = 0;

var teamB3Score1 = 0;
var teamB3Score2 = 0;
if (this.confirmed[0].last3GameAvg !==undefined) {
  teamA3Score1 = this.confirmed[0].last3GameAvg!;
}

if (this.confirmed[1]!==undefined && this.confirmed[1].last3GameAvg !==undefined) {
  teamA3Score2 = this.confirmed[1].last3GameAvg!;
}

if (this.confirmed[2]!==undefined  && this.confirmed[2].last3GameAvg !==undefined) {
  teamB3Score1 = this.confirmed[2].last3GameAvg!;
}

if (this.confirmed[3]!==undefined && this.confirmed[3].last3GameAvg !==undefined) {
  teamB3Score2 = this.confirmed[3].last3GameAvg!;
}
if (teamA3Score2==0) {
  tee.teamAavgScore = teamA3Score1;
} else {
  tee.teamAavgScore = (teamA3Score1 + teamA3Score2)/2;
}

if (teamB3Score2==0) {
  tee.teamBavgScore = teamB3Score1;
} else {
  tee.teamBavgScore = (teamB3Score1 + teamB3Score2)/2;
}

tee.teamAavghandicap=Math.round(tee.teamAavghandicap * 100) / 100;
tee.teamBavghandicap=Math.round(tee.teamBavghandicap * 100) / 100;

tee.teamAavgScore=Math.round(tee.teamAavgScore * 100) / 100;
tee.teamBavgScore=Math.round(tee.teamBavgScore * 100) / 100;




  this.teeList.push(tee)
  this.confirmed = [];

}

resetTee() {
  this.teeList.length=0;
  this.confirmed = [];

  this.totalTeamAHandicap = 0;
  this.totalTeamA3Score = 0;
  this.totalTeamBHandicap = 0;
  this.totalTeamB3Score = 0;
  this.totalNumberOfTees = 0;
  this.numberOfTees = 1;
}

}
