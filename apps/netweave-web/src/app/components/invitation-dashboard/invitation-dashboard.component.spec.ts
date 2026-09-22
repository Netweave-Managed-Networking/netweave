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
});
