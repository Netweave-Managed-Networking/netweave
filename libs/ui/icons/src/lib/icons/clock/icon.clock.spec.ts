import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconClock } from './icon.clock';

describe('IconClock', () => {
  let component: IconClock;
  let fixture: ComponentFixture<IconClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconClock],
    }).compileComponents();

    fixture = TestBed.createComponent(IconClock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
