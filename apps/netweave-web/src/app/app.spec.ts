import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WelcomeResponseDTO } from '@netweave/api-types';
import { App } from './app';

describe('App', () => {
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
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should render static content without change detection', () => {
    // Static DOM nodes are written during view creation (createComponent),
    // not during change detection — no detectChanges() needed here.
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Welcome Component',
    );
  });

  it('should display the message from the API response', async () => {
    // Kicks off the component lifecycle — the resource() effect fires here,
    // triggering the HTTP request.
    fixture.detectChanges();

    const mockResponse: WelcomeResponseDTO = { message: 'Hello, World!' };

    // Flush before whenStable(): the flush resolves the Promise (firstValueFrom),
    // which schedules the microtasks that whenStable() then drains.
    // Reversing this order causes the test to time out.
    const req = httpTesting.expectOne({ method: 'GET', url: '/api' });
    req.flush(mockResponse);

    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('pre')?.textContent).toContain(
      mockResponse.message,
    );
  });
});
