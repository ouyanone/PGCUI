import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventRepresentation } from 'src/app/services/api/models/event-representation';
import { CourseRepresentation } from 'src/app/services/api/models/course-representation';
import { SeasonRepresentation } from 'src/app/services/api/models/season-representation';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
})
export class EventDialogComponent implements OnInit {
  form: FormGroup;
  courses: CourseRepresentation[] = [];
  seasons: SeasonRepresentation[] = [];
  isEdit: boolean;

  readonly statusOptions = ['INIT', 'NOTSTART', 'FINISHED', 'CLOSED'];

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event?: EventRepresentation }
  ) {
    this.isEdit = !!data.event?.id;
    const e = data.event;
    this.form = this.fb.group({
      eventName: [e?.eventName || '', Validators.required],
      eventDesc: [e?.eventDesc || ''],
      eventDate: [e?.eventDate ? new Date(e.eventDate) : null, Validators.required],
      status:    [e?.status || 'INIT', Validators.required],
      courseId:  [e?.course?.id || null],
      seasonId:  [e?.season?.id || null],
    });
  }

  ngOnInit() {
    this.playerService.getCourses().subscribe(c => this.courses = c);
    this.playerService.getSeasons().subscribe(s => this.seasons = s);
  }

  courseLabel(c: CourseRepresentation): string {
    return `${c.clubName ?? ''} — ${c.courseName ?? ''}`.trim();
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const result: EventRepresentation = {
      ...(this.isEdit ? { id: this.data.event!.id } : {}),
      eventName: v.eventName,
      eventDesc: v.eventDesc || undefined,
      eventDate: v.eventDate ? this.toISODate(v.eventDate) : undefined,
      status:    v.status,
      course:    v.courseId ? { id: v.courseId } : undefined,
      season:    v.seasonId ? { id: v.seasonId } : undefined,
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
