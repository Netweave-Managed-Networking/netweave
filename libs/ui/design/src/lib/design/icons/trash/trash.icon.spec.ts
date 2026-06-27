import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrashIcon } from './trash.icon';

describe('TrashIcon', () => {
  let component: TrashIcon;
  let fixture: ComponentFixture<TrashIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrashIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(TrashIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
