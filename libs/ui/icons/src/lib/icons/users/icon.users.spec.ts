import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconUsers } from './icon.users';

describe('IconUsers', () => {
  let component: IconUsers;
  let fixture: ComponentFixture<IconUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconUsers],
    }).compileComponents();

    fixture = TestBed.createComponent(IconUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
