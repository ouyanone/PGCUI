import { Component, OnInit , Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  
  editdata: any;

  olddata: any;

  constructor(private service: PlayerService) {

  }

  ngOnInit(): void {
    this.service.getUpcomingEvent().subscribe(item => {
      this.editdata = item;
      console.log('event==='+this.editdata);
    });
    
    this.service.getLatestEvent().subscribe(item => {
      this.olddata = item;
      console.log('event==='+this.olddata);
    });

  }



}
