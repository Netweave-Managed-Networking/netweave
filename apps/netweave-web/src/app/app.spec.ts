import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrganizationDTO, WelcomeResponseDTO } from '@netweave/api-types';
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

  describe('Static Content', () => {
    it('should render static content without change detection', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.app__title')?.textContent).toContain(
        'Welcome Component',
      );
    });
  });

  describe('Welcome API', () => {
    it('should display the message from the welcome API response', async () => {
      fixture.detectChanges();

      const mockWelcomeResponse: WelcomeResponseDTO = {
        message: 'Hello, World!',
      };

      // Mock both endpoints
      const welcomeReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api',
      });
      welcomeReq.flush(mockWelcomeResponse);

      const latestOrgReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api/organizations/latest',
      });
      latestOrgReq.flush(null);

      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.app__welcome')?.textContent).toContain(
        mockWelcomeResponse.message,
      );
    });
  });

  describe('Latest Organization API', () => {
    it('should load organization data from the latest organizations endpoint', async () => {
      fixture.detectChanges();

      const welcomeReq = httpTesting.expectOne({ method: 'GET', url: '/api' });
      welcomeReq.flush({ message: 'Welcome' });

      const mockOrganization: OrganizationDTO = {
        name: 'Test Organization',
        contact: null,
      };

      const latestOrgReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api/organizations/latest',
      });
      latestOrgReq.flush(mockOrganization);

      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(
        compiled.querySelector('.app__organization')?.textContent,
      ).toContain(mockOrganization.name);
    });

    it('should handle null response when no organization exists', async () => {
      fixture.detectChanges();

      const welcomeReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api',
      });
      welcomeReq.flush({ message: 'Welcome' });

      const latestOrgReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api/organizations/latest',
      });
      latestOrgReq.flush(null);

      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.app__organization')?.textContent).toBe(
        '',
      );
    });

    it('should handle API error for latest organization endpoint', async () => {
      fixture.detectChanges();

      const welcomeReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api',
      });
      welcomeReq.flush({ message: 'Welcome' });

      const latestOrgReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api/organizations/latest',
      });

      latestOrgReq.flush(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.app__organization')?.textContent).toBe(
        '',
      );
    });
  });
});
