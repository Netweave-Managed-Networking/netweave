import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconHome } from './icon.home';

describe('IconHome', () => {
  let component: IconHome;
  let fixture: ComponentFixture<IconHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconHome],
    }).compileComponents();

    fixture = TestBed.createComponent(IconHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
