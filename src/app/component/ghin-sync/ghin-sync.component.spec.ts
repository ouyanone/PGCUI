import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GhinSyncComponent } from './ghin-sync.component';

describe('GhinSyncComponent', () => {
  let component: GhinSyncComponent;
  let fixture: ComponentFixture<GhinSyncComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GhinSyncComponent]
    });
    fixture = TestBed.createComponent(GhinSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
