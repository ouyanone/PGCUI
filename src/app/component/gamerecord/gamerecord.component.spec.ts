import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamerecordComponent } from './gamerecord.component';

describe('GamerecordComponent', () => {
  let component: GamerecordComponent;
  let fixture: ComponentFixture<GamerecordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GamerecordComponent]
    });
    fixture = TestBed.createComponent(GamerecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
