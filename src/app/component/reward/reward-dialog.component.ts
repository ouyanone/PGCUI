import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RewardRepresentation } from 'src/app/services/api/models/reward-representation';
import { PlayerRepresentation } from 'src/app/services/api/models/player-representation';
import { EventRepresentation } from 'src/app/services/api/models/event-representation';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-reward-dialog',
  templateUrl: './reward-dialog.component.html'
})
export class RewardDialogComponent implements OnInit {
  form: FormGroup;
  players: PlayerRepresentation[] = [];
  events: EventRepresentation[] = [];
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    public dialogRef: MatDialogRef<RewardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reward?: RewardRepresentation }
  ) {
    this.isEdit = !!data.reward?.id;
    const r = data.reward;
    this.form = this.fb.group({
      rewardName:   [r?.rewardName   || '', Validators.required],
      rewardDesc:   [r?.rewardDesc   || ''],
      rewardStory:  [r?.rewardStory  || ''],
      rewardGroup:  [r?.rewardGroup  || ''],
      displayOrder: [r?.displayOrder ?? null],
      eventId:      [r?.event?.id    || null, Validators.required],
      playerId:     [r?.player?.id   || null]
    });
  }

  ngOnInit() {
    this.playerService.getAllPlayer().subscribe(p => this.players = p);
    this.playerService.getAllEvent().subscribe((e: EventRepresentation[]) => this.events = e);
  }

  playerLabel(p: PlayerRepresentation): string {
    return `${p.fName ?? ''} ${p.lName ?? ''}`.trim();
  }

  eventLabel(e: EventRepresentation): string {
    return `${e.eventName ?? ''} (${e.eventDate ?? ''})`;
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const result: RewardRepresentation = {
      ...(this.isEdit ? { id: this.data.reward!.id } : {}),
      rewardName:   v.rewardName,
      rewardDesc:   v.rewardDesc  || undefined,
      rewardStory:  v.rewardStory || undefined,
      rewardGroup:  v.rewardGroup || undefined,
      displayOrder: v.displayOrder != null ? v.displayOrder : undefined,
      event:        v.eventId  ? { id: v.eventId }  : undefined,
      player:       v.playerId ? { id: v.playerId } : undefined
    };
    this.dialogRef.close(result);
  }

  cancel() { this.dialogRef.close(); }
}
