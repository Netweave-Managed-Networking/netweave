import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrganizationDTO } from '@netweave/api-types';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Latest Organization API', () => {
    it('should load organization data from the latest organizations endpoint', async () => {
      fixture.detectChanges();

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
        compiled.querySelector('.home__organization')?.textContent,
      ).toContain(mockOrganization.name);
    });

    it('should handle null response when no organization exists', async () => {
      fixture.detectChanges();

      const latestOrgReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api/organizations/latest',
      });
      latestOrgReq.flush(null);

      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.home__organization')?.textContent).toBe(
        '',
      );
    });

    it('should handle API error for latest organization endpoint', async () => {
      fixture.detectChanges();

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
      expect(compiled.querySelector('.home__organization')?.textContent).toBe(
        '',
      );
    });
  });
});
