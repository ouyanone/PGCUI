import { Component, Inject, OnInit } from '@angular/core';
import { PopupComponent } from '../popup/popup.component';
import { PlayerService } from '../../services/player.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ghin-sync',
  templateUrl: './ghin-sync.component.html',
  styleUrls: ['./ghin-sync.component.css']
})
export class GhinSyncComponent implements OnInit{
  ngOnInit(): void {
    this.inputdata=this.data;
  }
  inputdata: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private ref: MatDialogRef<PopupComponent>, private buildr: FormBuilder,
  private service: PlayerService) {

  }

  closepopup(){
    this.ref.close('Closed using function');
  }


  updateHandicap() {
    console.log("in update handicap..."+this.myform.value.token);
    this.service.updatePlayersHandicap(this.myform.value).subscribe(res => {
      this.closepopup();
    });

    this.closepopup();
  }


  myform = this.buildr.group({
    token: this.buildr.control('')
  });
}
