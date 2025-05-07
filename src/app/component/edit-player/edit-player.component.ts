import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-edit-player',
  templateUrl: './edit-player.component.html',
  styleUrls: ['./edit-player.component.css']
})
export class EditPlayerComponent implements OnInit {
  inputdata: any;
  editdata: any;
  closemessage = 'closed using directive'
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private ref: MatDialogRef<EditPlayerComponent>, private buildr: FormBuilder,
    private service: PlayerService) {

  }
  ngOnInit(): void {
    this.inputdata = this.data;
    console.log('userid==='+this.inputdata.userId);
    if(this.inputdata.userId>0){
      console.log('init form');
      this.setpopupdata(this.inputdata.userId)
    }
  }

  setpopupdata(id: any) {
    this.service.getPlayerById(id).subscribe(item => {
      this.editdata = item;
      this.myform.setValue({id:this.editdata.id,fName:this.editdata.fName,lName:this.editdata.lName,ghinNumber:this.editdata.ghinNumber,phone:this.editdata.phone,email:this.editdata.email,
        nickName:this.editdata.nickName,chineseNickName:this.editdata.chineseNickName,handicap:this.editdata.handicap,last3GameAvg:this.editdata.last3GameAvg, clubId:this.editdata.clubId,clubName:this.editdata.clubName, desc:this.editdata.desc})
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
    last3GameAvg:  this.buildr.control(''),
    clubId: this.buildr.control(''),
    clubName: this.buildr.control(''),
    desc:this.buildr.control('')
  });

  Edituser() {
    this.service.editPlayer(this.myform.value).subscribe(res => {
      this.closepopup();
    });
  }
}

