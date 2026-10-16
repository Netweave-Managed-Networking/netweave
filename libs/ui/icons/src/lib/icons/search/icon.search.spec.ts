import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconSearch } from './icon.search';

describe('IconSearch', () => {
  let component: IconSearch;
  let fixture: ComponentFixture<IconSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(IconSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
