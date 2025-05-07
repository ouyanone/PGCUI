import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  inputdata: any;
  editdata: any;
  closemessage = 'closed using directive'
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private ref: MatDialogRef<PopupComponent>, private buildr: FormBuilder,
    private service: PlayerService) {

  }
  ngOnInit(): void {
    this.inputdata = this.data;
    if(this.inputdata.code>0){
      this.setpopupdata(this.inputdata.code)
    }
  }

  setpopupdata(id: any) {
    this.service.getPlayerById(id).subscribe(item => {
      this.editdata = item;
      this.myform.setValue({id:this.editdata.golferId,fName:this.editdata.fName,lName:this.editdata.lName,ghinNumber:this.editdata.ghinNumber,phone:this.editdata.phone,email:this.editdata.email,
        nickName:this.editdata.nickName,chineseNickName:this.editdata.chineseNickName,handicap:this.editdata.handicap,clubId:this.editdata.clubId,clubName:this.editdata.clubName})
    });
  }

  closepopup() {
    this.ref.close('Closed using function');
  }

  myform = this.buildr.group({
    id: this.buildr.control(''),
    fName: this.buildr.control(''),
    lName: this.buildr.control(''),
    ghinNumber: this.buildr.control(''),
    phone: this.buildr.control(''),
    email: this.buildr.control(''),
    nickName: this.buildr.control(''),
    chineseNickName: this.buildr.control(''),
    handicap: this.buildr.control(''),
    clubId: this.buildr.control(''),
    clubName: this.buildr.control('')
  });

  Saveuser() {
    this.service.savePlayer(this.myform.value).subscribe(res => {
      this.closepopup();
    });
  }
}
