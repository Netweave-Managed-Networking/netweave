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

    const req = httpTesting.expectOne((r) => r.url === '/api/matchings/runs');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('20');
    req.flush(
      page([
        {
          id: 2,
          createdAt,
          finishedAt: createdAt,
          failedAt: null,
          cancelledAt: null,
          matchingCount: 12,
        },
        {
          id: 1,
          createdAt,
          finishedAt: null,
          failedAt: createdAt,
          cancelledAt: null,
          matchingCount: 0,
        },
      ]),
    );

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.matching-history__entry').length).toBe(
      2,
    );
    expect(
      compiled.querySelector('.matching-history__matching-count')?.textContent,
    ).toContain('12 Matchings');
  });

  it('shows the run duration, or that it is still running', async () => {
    fixture.detectChanges();

    const startedAt = new Date('2026-09-29T10:00:00Z');
    const finishedAt = new Date('2026-09-29T10:02:30Z'); // 2m 30s later

    httpTesting
      .expectOne((r) => r.url === '/api/matchings/runs')
      .flush(
        page([
          {
            id: 2,
            createdAt: startedAt,
            finishedAt,
            failedAt: null,
            cancelledAt: null,
            matchingCount: 6,
          },
          {
            id: 1,
            createdAt: startedAt,
            finishedAt: null,
            failedAt: null,
            cancelledAt: null,
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

  it('shows a cancelled run as such, with the time it ran until it was cancelled', async () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/matchings/runs')
      .flush(
        page([
          {
            id: 3,
            createdAt: new Date('2026-09-29T10:00:00Z'),
            finishedAt: null,
            failedAt: null,
            cancelledAt: new Date('2026-09-29T10:00:45Z'),
            matchingCount: 4,
          },
        ]),
      );

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('.matching-history__entry')?.textContent,
    ).toContain('Durchlauf #3: Abgebrochen');
    expect(
      compiled
        .querySelector('.matching-history__duration')
        ?.textContent?.trim(),
    ).toBe('Dauer: 45s');
    expect(compiled.querySelector('.matching-history__cancelled')).toBeTruthy();
    expect(compiled.querySelector('.status-neutral')).toBeTruthy();
  });

  describe('start', () => {
    const finishedRun: MatchingRunListItemDTO = {
      id: 2,
      createdAt,
      finishedAt: createdAt,
      failedAt: null,
      cancelledAt: null,
      matchingCount: 6,
    };
    const runningRun: MatchingRunListItemDTO = {
      id: 3,
      createdAt,
      finishedAt: null,
      failedAt: null,
      cancelledAt: null,
      matchingCount: 0,
    };

    const compiled = () => fixture.nativeElement as HTMLElement;
    const startButton = () =>
      compiled().querySelector(
        '.matching-history__start-button',
      ) as HTMLButtonElement;
    const startError = () =>
      compiled()
        .querySelector('.matching-history__start-error')
        ?.textContent?.trim();

    const loadHistory = async (
      items: MatchingRunListItemDTO[],
      total = items.length,
    ) => {
      httpTesting
        .expectOne((r) => r.url === '/api/matchings/runs' && r.method === 'GET')
        .flush(page(items, total));
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
    };

    // the reload only sends its request on the next change detection, which the app schedules by itself
    const waitForPoll = async () => {
      await vi.advanceTimersByTimeAsync(2000);
      fixture.detectChanges();
    };

    const clickStartAndExpectRequest = () => {
      startButton().click();
      fixture.detectChanges();
      expect(startButton().disabled).toBe(true);
      return httpTesting.expectOne({
        method: 'POST',
        url: '/api/matchings/runs',
      });
    };

    beforeEach(() => {
      vi.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
      });
      fixture.detectChanges();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('starts a run, shows it right away and keeps it current until it finishes', async () => {
      await loadHistory([finishedRun]);
      expect(startButton().disabled).toBe(false);

      clickStartAndExpectRequest().flush(
        { ...runningRun, updatedAt: createdAt },
        { status: 202, statusText: 'Accepted' },
      );
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
      await loadHistory([runningRun, finishedRun]);

      expect(startButton().disabled).toBe(true); // a run is in progress
      expect(
        compiled().querySelectorAll('.matching-history__entry'),
      ).toHaveLength(2);

      await waitForPoll();
      await loadHistory([{ ...runningRun, matchingCount: 2 }, finishedRun]); // still running

      await waitForPoll();
      await loadHistory([
        { ...runningRun, finishedAt: createdAt, matchingCount: 6 },
        finishedRun,
      ]);

      expect(startButton().disabled).toBe(false);
      expect(
        compiled().querySelector('.matching-history__entry')?.textContent,
      ).toContain('Durchlauf #3: Abgeschlossen');

      await waitForPoll(); // no more polling once nothing is running, verified by httpTesting.verify()
    });

    it('shows the run some other trigger started meanwhile instead of an error', async () => {
      await loadHistory([finishedRun]);

      clickStartAndExpectRequest().flush(null, {
        status: 409,
        statusText: 'Conflict',
      });
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
      await loadHistory([runningRun, finishedRun]);

      expect(startError()).toBeUndefined();
      expect(startButton().disabled).toBe(true);
      expect(
        compiled().querySelector('.matching-history__start')?.textContent,
      ).toContain('Es läuft bereits eine Berechnung.');

      await waitForPoll();
      await loadHistory([
        { ...runningRun, finishedAt: createdAt },
        finishedRun,
      ]);
    });

    it('is only offered on the first page, right above the newest run', async () => {
      await loadHistory([finishedRun], 25);
      expect(startButton()).toBeTruthy();

      compiled()
        .querySelector<HTMLButtonElement>('.matching-history__next-page')
        ?.click();
      fixture.detectChanges();
      await loadHistory([finishedRun], 25);

      expect(startButton()).toBeNull();
    });

    it('is offered even when there is no run yet', async () => {
      await loadHistory([]);

      expect(startButton().disabled).toBe(false);
      expect(compiled().querySelector('.matching-history__empty')).toBeTruthy();
    });

    it('shows an error when the run fails to start', async () => {
      await loadHistory([finishedRun]);

      clickStartAndExpectRequest().flush(null, {
        status: 500,
        statusText: 'Server Error',
      });
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
      await loadHistory([finishedRun]);

      expect(startError()).toBe('Berechnung konnte nicht gestartet werden.');
    });
  });

  describe('cancel', () => {
    const runningRun: MatchingRunListItemDTO = {
      id: 3,
      createdAt,
      finishedAt: null,
      failedAt: null,
      cancelledAt: null,
      matchingCount: 2,
    };
    const finishedRun: MatchingRunListItemDTO = {
      id: 2,
      createdAt,
      finishedAt: createdAt,
      failedAt: null,
      cancelledAt: null,
      matchingCount: 6,
    };

    const cancelButtons = () =>
      Array.from(
        (
          fixture.nativeElement as HTMLElement
        ).querySelectorAll<HTMLButtonElement>(
          '.matching-history__cancel-button',
        ),
      );

    const loadHistory = async (items: MatchingRunListItemDTO[]) => {
      httpTesting
        .expectOne((r) => r.url === '/api/matchings/runs')
        .flush(page(items));
      await fixture.whenStable();
      fixture.detectChanges();
    };

    beforeEach(async () => {
      fixture.detectChanges();
      await loadHistory([runningRun, finishedRun]);
    });

    it('is only offered for runs still in progress', () => {
      expect(cancelButtons()).toHaveLength(1);
      expect(
        cancelButtons()[0].closest('.matching-history__entry')?.textContent,
      ).toContain('Durchlauf #3');
    });

    it('cancels the run and reloads the history to show it as cancelled', async () => {
      cancelButtons()[0].click();
      fixture.detectChanges();
      expect(cancelButtons()[0].disabled).toBe(true);

      httpTesting
        .expectOne({ method: 'POST', url: '/api/matchings/runs/3/cancel' })
        .flush({ ...runningRun, updatedAt: createdAt, cancelledAt: createdAt });
      fixture.detectChanges();

      // the list stays in place while reloading, no spinner instead of it
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          '.matching-history__loading',
        ),
      ).toBeNull();

      await loadHistory([
        { ...runningRun, cancelledAt: createdAt },
        finishedRun,
      ]);

      expect(cancelButtons()).toHaveLength(0);
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          '.matching-history__entry',
        )?.textContent,
      ).toContain('Durchlauf #3: Abgebrochen');
    });

    it('reloads the history to show how the run really ended when cancelling fails', async () => {
      cancelButtons()[0].click();
      fixture.detectChanges();

      httpTesting
        .expectOne({ method: 'POST', url: '/api/matchings/runs/3/cancel' })
        .flush(null, { status: 409, statusText: 'Conflict' });
      fixture.detectChanges();

      await loadHistory([
        { ...runningRun, finishedAt: createdAt },
        finishedRun,
      ]);

      expect(cancelButtons()).toHaveLength(0);
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          '.matching-history__entry',
        )?.textContent,
      ).toContain('Durchlauf #3: Abgeschlossen');
    });
  });

  it('shows an empty message when there is no run yet', async () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/matchings/runs')
      .flush(page([]));

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
              cancelledAt: null,
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
            cancelledAt: null,
            matchingCount: 6,
          },
        ]),
      );

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector<HTMLButtonElement>('.matching-history__prev-page')
        ?.disabled,
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
