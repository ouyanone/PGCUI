import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadScoreComponent } from './upload-score.component';

describe('UploadScoreComponent', () => {
  let component: UploadScoreComponent;
  let fixture: ComponentFixture<UploadScoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadScoreComponent]
    });
    fixture = TestBed.createComponent(UploadScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
