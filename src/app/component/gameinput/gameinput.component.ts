import { Component, OnInit , Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from 'src/app/services/player.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gameinput',
  templateUrl: './gameinput.component.html',
  styleUrls: ['./gameinput.component.css']
})
export class GameinputComponent  implements OnInit  {

  inputdata: any;
  editdata: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private ref: MatDialogRef<GameinputComponent>,
  private service: PlayerService, private router:Router) {

  }

  ngOnInit(): void {
    this.inputdata = this.data;
    console.log('eventId==='+this.inputdata.eventId);
    if(this.inputdata.eventId>0){
      console.log('init form');
      this.setpopupdata(this.inputdata.eventId)
    }
  }

  setpopupdata(id: any) {
    console.log('eventid==='+id);

    this.service.getEventById(id).subscribe(item => {
      this.editdata = item;
      console.log('event==='+this.editdata);
    });
  }

  onSubmitScore() {
    console.log('submitting score'+JSON.stringify(this.editdata, null, 4));

    this.service.submitScore(this.editdata).subscribe(res => {
      console.log("calling event..."+res);
      this.router.navigate(['gamerecord']);

      console.log("calling event...");
      this.closepopup();
    },

      err => console.log("calling event...err"+err)
    );

  }

  deleteEvent() {
    console.log('deleting event');

    this.service.deleteEvent(this.editdata.id).subscribe(res => {
      console.log("calling event..."+res);
      this.router.navigate(['gamerecord']);

      this.closepopup();
    },

      err => console.log("calling event...err"+err)
    );
  }


  closepopup() {
    this.ref.close('Closed using function');
  }


}
