import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameinputComponent } from './gameinput.component';

describe('GameinputComponent', () => {
  let component: GameinputComponent;
  let fixture: ComponentFixture<GameinputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameinputComponent]
    });
    fixture = TestBed.createComponent(GameinputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
