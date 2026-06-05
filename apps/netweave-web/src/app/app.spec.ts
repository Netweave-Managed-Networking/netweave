import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WelcomeResponseDTO } from '@netweave/api-types';
import { App } from './app';
import { TopNavComponent } from './top-nav/top-nav.component';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    })
      .overrideComponent(TopNavComponent, {
        set: {
          template: '<div class="top-nav">{{ welcomeText() }}</div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Welcome API', () => {
    it('should handover the the message from the welcome API response to the top navigation component', async () => {
      fixture.detectChanges();

      const mockWelcomeResponse: WelcomeResponseDTO = {
        message: 'Hello, World!',
      };

      const welcomeReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api',
      });
      welcomeReq.flush(mockWelcomeResponse);

      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.top-nav')?.textContent).toContain(
        mockWelcomeResponse.message,
      );
    });
  });
});
