import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';
import { PlayerService } from 'src/app/services/player.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-edit-player',
  templateUrl: './edit-player.component.html',
  styleUrls: ['./edit-player.component.css']
})
export class EditPlayerComponent implements OnInit {
  inputdata: any;
  editdata: any;
  isLoggedIn = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref: MatDialogRef<EditPlayerComponent>,
    private buildr: FormBuilder,
    private service: PlayerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.inputdata = this.data;

    if (this.inputdata.userId > 0) {
      combineLatest([
        this.authService.getStatus(),
        this.service.getPlayerById(this.inputdata.userId)
      ]).subscribe(([status, item]) => {
        this.isLoggedIn = status.loggedIn;
        this.editdata = item;

        if (!status.loggedIn) {
          this.myform.disable();
        }

        this.myform.setValue({
          id:               String(item.id ?? ''),
          fName:            item.fName ?? '',
          lName:            item.lName ?? '',
          ghinNumber:       item.ghinNumber ?? '',
          phone:            status.loggedIn ? (item.phone ?? '') : this.maskPhone(item.phone),
          email:            status.loggedIn ? (item.email ?? '') : this.maskEmail(item.email),
          nickName:         item.nickName ?? '',
          chineseNickName:  item.chineseNickName ?? '',
          handicap:         String(item.handicap ?? ''),
          pgcHandicap:      String(item.pgcHandicap ?? ''),
          last3GameAvg:     String(item.last3GameAvg ?? ''),
          clubId:           item.clubId ?? '',
          clubName:         item.clubName ?? '',
          level:            item.level ?? 0,
          pgc2025:          item.pgc2025 ?? false,
          isActive:         item.isActive ?? false,
          desc:             item.desc ?? '',
        });
      });
    }
  }

  private maskPhone(phone?: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    return '***-***-' + digits.slice(-4);
  }

  private maskEmail(email?: string): string {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (!domain) return '***';
    const tld = domain.split('.').pop() ?? '';
    return (user[0] ?? '*') + '***@***.' + tld;
  }

  get initials(): string {
    if (!this.editdata) return '?';
    return `${(this.editdata.fName ?? '')[0] ?? ''}${(this.editdata.lName ?? '')[0] ?? ''}`.toUpperCase();
  }

  myform = this.buildr.group({
    id:              this.buildr.control(''),
    fName:           this.buildr.control(''),
    lName:           this.buildr.control(''),
    ghinNumber:      this.buildr.control(''),
    phone:           this.buildr.control(''),
    email:           this.buildr.control(''),
    nickName:        this.buildr.control(''),
    chineseNickName: this.buildr.control(''),
    handicap:        this.buildr.control(''),
    pgcHandicap:     this.buildr.control(''),
    last3GameAvg:    this.buildr.control(''),
    clubId:          this.buildr.control(''),
    clubName:        this.buildr.control(''),
    level:           this.buildr.control(0),
    pgc2025:         this.buildr.control(false),
    isActive:        this.buildr.control(false),
    desc:            this.buildr.control(''),
  });

  save() {
    this.service.editPlayer(this.myform.value).subscribe(() => this.ref.close('saved'));
  }

  close() {
    this.ref.close();
  }
}
