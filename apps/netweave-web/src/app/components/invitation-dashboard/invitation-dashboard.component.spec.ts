import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvitationListItemDTO } from '@netweave/api-types';
import { InvitationDashboardComponent } from './invitation-dashboard.component';

describe('InvitationDashboardComponent', () => {
  let component: InvitationDashboardComponent;
  let fixture: ComponentFixture<InvitationDashboardComponent>;
  let httpTesting: HttpTestingController;

  const mockInvitations: InvitationListItemDTO[] = [
    {
      id: 1,
      email: 'failed@example.com',
      status: 'failed',
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 2,
      email: 'pending@example.com',
      status: 'pending',
      createdAt: new Date('2026-01-02'),
    },
    {
      id: 3,
      email: 'answered@example.com',
      status: 'answered',
      createdAt: new Date('2026-01-03'),
    },
    {
      id: 4,
      email: 'dispatched@example.com',
      status: 'dispatched',
      createdAt: new Date('2026-01-04'),
    },
    {
      id: 5,
      email: 'expired@example.com',
      status: 'expired',
      createdAt: new Date('2026-01-05'),
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationDashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(InvitationDashboardComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/invitations').flush([]);
    expect(component).toBeTruthy();
  });

  it('renders a row per invitation and computes the summary counts', async () => {
    fixture.detectChanges();

    httpTesting.expectOne('/api/invitations').flush(mockInvitations);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelectorAll('.invitation-dashboard__email-td').length,
    ).toBe(5);

    expect(
      compiled.querySelector('.invitation-dashboard__stat-awaiting .stat-value')
        ?.textContent,
    ).toContain('2');
    expect(
      compiled.querySelector('.invitation-dashboard__stat-answered .stat-value')
        ?.textContent,
    ).toContain('1');
    expect(
      compiled.querySelector('.invitation-dashboard__stat-failed .stat-value')
        ?.textContent,
    ).toContain('2');
  });

  it('handles API errors by rendering an empty list', async () => {
    fixture.detectChanges();

    httpTesting
      .expectOne('/api/invitations')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelectorAll('.invitation-dashboard__email-td').length,
    ).toBe(0);
  });

  describe('sorting', () => {
    const emails = (compiled: HTMLElement) =>
      Array.from(
        compiled.querySelectorAll('.invitation-dashboard__email-td'),
      ).map((td) => td.textContent?.trim());

    const clickHeader = async (compiled: HTMLElement, thClass: string) => {
      compiled.querySelector<HTMLButtonElement>(`.${thClass} button`)?.click();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    let compiled: HTMLElement;

    beforeEach(async () => {
      fixture.detectChanges();
      // deliberately shuffled to prove the component sorts on its own
      httpTesting
        .expectOne('/api/invitations')
        .flush([...mockInvitations].reverse());
      await fixture.whenStable();
      fixture.detectChanges();
      compiled = fixture.nativeElement as HTMLElement;
    });

    it('sorts by status by default', () => {
      expect(emails(compiled)).toEqual([
        'failed@example.com',
        'pending@example.com',
        'answered@example.com',
        'dispatched@example.com',
        'expired@example.com',
      ]);
      expect(
        compiled
          .querySelector('.invitation-dashboard__status-th')
          ?.getAttribute('aria-sort'),
      ).toBe('ascending');
    });

    it('renders the creation date as its own column', () => {
      expect(
        compiled.querySelector('.invitation-dashboard__created-at-td')
          ?.textContent,
      ).toContain('01.01.2026');
    });

    it('toggles the direction when the active column is clicked again', async () => {
      await clickHeader(compiled, 'invitation-dashboard__status-th');
      expect(emails(compiled)[0]).toBe('expired@example.com');
    });

    it('sorts by email and creation date', async () => {
      await clickHeader(compiled, 'invitation-dashboard__email-th');
      expect(emails(compiled)).toEqual([
        'answered@example.com',
        'dispatched@example.com',
        'expired@example.com',
        'failed@example.com',
        'pending@example.com',
      ]);

      await clickHeader(compiled, 'invitation-dashboard__created-at-th');
      expect(emails(compiled)[0]).toBe('failed@example.com');
      await clickHeader(compiled, 'invitation-dashboard__created-at-th');
      expect(emails(compiled)[0]).toBe('expired@example.com');
    });
  });
});
