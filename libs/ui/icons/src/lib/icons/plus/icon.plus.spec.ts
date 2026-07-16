import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconPlus } from './icon.plus';

describe('IconPlus', () => {
  let component: IconPlus;
  let fixture: ComponentFixture<IconPlus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconPlus],
    }).compileComponents();

    fixture = TestBed.createComponent(IconPlus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
