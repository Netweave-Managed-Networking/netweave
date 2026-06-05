import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginButtonComponent } from '../login-button/login-button.component';
import { TopNavComponent } from './top-nav.component';

describe('TopNav', () => {
  let component: TopNavComponent;
  let fixture: ComponentFixture<TopNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNavComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(LoginButtonComponent, {
        set: { template: '<button>Login</button>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopNavComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
