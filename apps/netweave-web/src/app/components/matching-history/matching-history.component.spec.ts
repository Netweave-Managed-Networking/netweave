import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchingRunListItemDTO, PaginatedDTO } from '@netweave/api-types';
import { MatchingHistoryComponent } from './matching-history.component';

const createdAt = new Date('2026-09-29T10:00:00Z');

const page = (
  items: MatchingRunListItemDTO[],
  total = items.length,
): PaginatedDTO<MatchingRunListItemDTO> => ({
  items,
  page: 1,
  pageSize: 20,
  total,
});

describe('MatchingHistoryComponent', () => {
  let fixture: ComponentFixture<MatchingHistoryComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchingHistoryComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchingHistoryComponent);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('requests the first page and renders one entry per run', async () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne(
      (r) => r.url === '/api/matchings/runs',
    );
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('20');
    req.flush(
      page([
        {
          id: 2,
          createdAt,
          finishedAt: createdAt,
          failedAt: null,
          matchingCount: 12,
        },
        {
          id: 1,
          createdAt,
          finishedAt: null,
          failedAt: createdAt,
          matchingCount: 0,
        },
      ]),
    );

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelectorAll('.matching-history__entry').length,
    ).toBe(2);
    expect(
      compiled.querySelector('.matching-history__matching-count')
        ?.textContent,
    ).toContain('12 Matchings');
  });

  it('shows the run duration, or that it is still running', async () => {
    fixture.detectChanges();

    const startedAt = new Date('2026-09-29T10:00:00Z');
    const finishedAt = new Date('2026-09-29T10:02:30Z'); // 2m 30s later

    httpTesting.expectOne((r) => r.url === '/api/matchings/runs').flush(
      page([
        {
          id: 2,
          createdAt: startedAt,
          finishedAt,
          failedAt: null,
          matchingCount: 6,
        },
        {
          id: 1,
          createdAt: startedAt,
          finishedAt: null,
          failedAt: null,
          matchingCount: 0,
        },
      ]),
    );

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const durations = Array.from(
      compiled.querySelectorAll('.matching-history__duration'),
    ).map((el) => el.textContent?.trim());
    expect(durations).toEqual(['Dauer: 2m 30s', 'Läuft noch...']);
  });

  it('shows an empty message when there is no run yet', async () => {
    fixture.detectChanges();

    httpTesting.expectOne((r) => r.url === '/api/matchings/runs').flush(
      page([]),
    );

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.matching-history__empty')).toBeTruthy();
  });

  it('requests the next page when the next-page button is clicked', async () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/matchings/runs')
      .flush(
        page(
          [
            {
              id: 1,
              createdAt,
              finishedAt: createdAt,
              failedAt: null,
              matchingCount: 6,
            },
          ],
          25,
        ),
      );

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled
      .querySelector<HTMLButtonElement>('.matching-history__next-page')
      ?.click();
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/matchings/runs');
    expect(req.request.params.get('page')).toBe('2');
    req.flush(page([]));

    await fixture.whenStable();
  });

  it('disables the previous-page button on the first page', async () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/matchings/runs')
      .flush(
        page([
          {
            id: 1,
            createdAt,
            finishedAt: createdAt,
            failedAt: null,
            matchingCount: 6,
          },
        ]),
      );

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector<HTMLButtonElement>(
        '.matching-history__prev-page',
      )?.disabled,
    ).toBe(true);
  });

  it('handles API errors by rendering the empty state', async () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/matchings/runs')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.matching-history__empty')).toBeTruthy();
  });
});
