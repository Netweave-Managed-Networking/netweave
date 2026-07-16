import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconSettings } from './icon.settings';

describe('IconSettings', () => {
  let component: IconSettings;
  let fixture: ComponentFixture<IconSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(IconSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
