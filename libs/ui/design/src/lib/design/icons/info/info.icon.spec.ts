import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoIcon } from './info.icon';

describe('InfoIcon', () => {
  let component: InfoIcon;
  let fixture: ComponentFixture<InfoIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
