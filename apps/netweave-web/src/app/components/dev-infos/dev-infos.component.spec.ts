import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberDTO } from '@netweave/api-types';
import { DevInfosComponent } from './dev-infos.component';

describe('DevInfos', () => {
  let component: DevInfosComponent;
  let fixture: ComponentFixture<DevInfosComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevInfosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DevInfosComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Latest Member API', () => {
    it('should load member data from the latest members endpoint', async () => {
      fixture.detectChanges();

      const mockMember: MemberDTO = {
        name: 'Test Member',
        contact: null,
      } as MemberDTO;

      const latestOrgReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api/members/latest',
      });
      latestOrgReq.flush(mockMember);

      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(
        compiled.querySelector('.dev-infos__member')?.textContent,
      ).toContain(mockMember.name);
    });

    it('should handle null response when no member exists', async () => {
      fixture.detectChanges();

      const latestOrgReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api/members/latest',
      });
      latestOrgReq.flush(null);

      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.dev-infos__member')?.textContent).toBe(
        'No member added yet.',
      );
    });

    it('should handle API error for latest member endpoint', async () => {
      fixture.detectChanges();

      const latestOrgReq = httpTesting.expectOne({
        method: 'GET',
        url: '/api/members/latest',
      });

      latestOrgReq.flush(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.dev-infos__member')?.textContent).toBe(
        'No member added yet.',
      );
    });
  });
});
