import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconTrash } from './icon.trash';

describe('IconTrash', () => {
  let component: IconTrash;
  let fixture: ComponentFixture<IconTrash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconTrash],
    }).compileComponents();

    fixture = TestBed.createComponent(IconTrash);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
