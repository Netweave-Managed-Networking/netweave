import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlusIcon } from './plus.icon';

describe('PlusIcon', () => {
  let component: PlusIcon;
  let fixture: ComponentFixture<PlusIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlusIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(PlusIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
