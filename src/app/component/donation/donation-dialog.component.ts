import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DonationRepresentation } from 'src/app/services/api/models/donation-representation';
import { PlayerRepresentation } from 'src/app/services/api/models/player-representation';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-donation-dialog',
  templateUrl: './donation-dialog.component.html',
})
export class DonationDialogComponent implements OnInit {
  form: FormGroup;
  players: PlayerRepresentation[] = [];
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    public dialogRef: MatDialogRef<DonationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { donation?: DonationRepresentation }
  ) {
    this.isEdit = !!data.donation?.id;
    const d = data.donation;
    this.form = this.fb.group({
      donationName: [d?.donationName || '', Validators.required],
      donationDesc: [d?.donationDesc || ''],
      donationDate: [d?.donationDate ? new Date(d.donationDate) : null],
      amount:       [d?.amount ?? null],
      playerId:     [d?.player?.id || null]
    });
  }

  ngOnInit() {
    this.playerService.getAllPlayer().subscribe(p => this.players = p);
  }

  playerLabel(p: PlayerRepresentation): string {
    return `${p.fName ?? ''} ${p.lName ?? ''}`.trim();
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const result: DonationRepresentation = {
      ...(this.isEdit ? { id: this.data.donation!.id } : {}),
      donationName: v.donationName,
      donationDesc: v.donationDesc || undefined,
      donationDate: v.donationDate ? this.toISODate(v.donationDate) : undefined,
      amount:       v.amount != null ? v.amount : undefined,
      player:       v.playerId ? { id: v.playerId } : undefined
    };
    this.dialogRef.close(result);
  }

  cancel() {
    this.dialogRef.close();
  }

  private toISODate(d: Date | string): string {
    if (typeof d === 'string') return d;
    return d.toISOString().split('T')[0];
  }
}
