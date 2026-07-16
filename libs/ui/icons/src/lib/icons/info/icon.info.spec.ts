import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconInfo } from './icon.info';

describe('IconInfo', () => {
  let component: IconInfo;
  let fixture: ComponentFixture<IconInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(IconInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
