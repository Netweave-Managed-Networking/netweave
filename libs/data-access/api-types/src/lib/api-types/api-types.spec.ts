import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiTypes } from './api-types';

describe('ApiTypes', () => {
  let component: ApiTypes;
  let fixture: ComponentFixture<ApiTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
