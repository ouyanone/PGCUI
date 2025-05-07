import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameruleComponent } from './gamerule.component';

describe('GameruleComponent', () => {
  let component: GameruleComponent;
  let fixture: ComponentFixture<GameruleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameruleComponent]
    });
    fixture = TestBed.createComponent(GameruleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
