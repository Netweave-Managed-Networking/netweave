import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchingRunDTO } from '@netweave/api-types';
import { MatchingRunComponent } from './matching-run.component';

describe('MatchingRunComponent', () => {
  let fixture: ComponentFixture<MatchingRunComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchingRunComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchingRunComponent);
    httpTesting = TestBed.inject(HttpTestingController);

    httpTesting
      .expectOne({ method: 'GET', url: '/api/matchings/runs/latest' })
      .flush(null, { status: 404, statusText: 'Not Found' });
    httpTesting
      .expectOne({ method: 'GET', url: '/api/matchings/runs/newest' })
      .flush(null, { status: 404, statusText: 'Not Found' });

    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
    vi.useRealTimers();
  });

  const button = () =>
    fixture.nativeElement.querySelector(
      '.matching-run__button',
    ) as HTMLButtonElement;
  const result = () =>
    (
      fixture.nativeElement.querySelector('.matching-run__result') as
        | HTMLElement
        | undefined
    )?.textContent?.trim();
  const lastRun = () =>
    (
      fixture.nativeElement.querySelector('.matching-run__last-run') as
        | HTMLElement
        | undefined
    )?.textContent?.trim();

  const clickAndExpectRequest = () => {
    button().click();
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    return httpTesting.expectOne({
      method: 'POST',
      url: '/api/matchings/runs',
    });
  };

  // the request only starts the run; it flushes as soon as it's created, well before it finishes
  const startedRun: MatchingRunDTO = {
    id: 7,
    createdAt: new Date('2026-09-30T10:00:00Z'),
    updatedAt: new Date('2026-09-30T10:00:00Z'),
    finishedAt: null,
    failedAt: null,
    matchingCount: 0,
  };

  const pollAndFlush = async (run: MatchingRunDTO) => {
    await vi.advanceTimersByTimeAsync(2000);
    httpTesting
      .expectOne({ method: 'GET', url: '/api/matchings/runs/7' })
      .flush(run);
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
  };

  it('starts a run and shows how many matchings were calculated once it finishes', async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
    });

    clickAndExpectRequest().flush(startedRun, {
      status: 202,
      statusText: 'Accepted',
    });
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    expect(button().disabled).toBe(true); // still computing in the background

    await pollAndFlush({
      ...startedRun,
      finishedAt: new Date('2026-09-30T10:00:05Z'),
      matchingCount: 3,
    });

    expect(button().disabled).toBe(false);
    expect(result()).toContain('#7');
    expect(result()).toContain('3 Matchings');
  });

  it('shows an error when the background computation fails', async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
    });

    clickAndExpectRequest().flush(startedRun, {
      status: 202,
      statusText: 'Accepted',
    });
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    await pollAndFlush({
      ...startedRun,
      failedAt: new Date('2026-09-30T10:00:05Z'),
    });

    expect(result()).toBe('Berechnung fehlgeschlagen.');
  });

  it('tells when a run is already in progress', async () => {
    clickAndExpectRequest().flush(null, {
      status: 409,
      statusText: 'Conflict',
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(result()).toBe('Es läuft bereits eine Berechnung.');
  });

  it('shows an error when the run fails to start', async () => {
    clickAndExpectRequest().flush(null, {
      status: 500,
      statusText: 'Server Error',
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(result()).toBe('Berechnung fehlgeschlagen.');
  });

  it('shows nothing when no run has happened yet', () => {
    expect(lastRun()).toBeUndefined();
  });

  it('shows the last persisted run on load, before anyone clicks the button', async () => {
    const localFixture = TestBed.createComponent(MatchingRunComponent);
    httpTesting
      .expectOne({ method: 'GET', url: '/api/matchings/runs/latest' })
      .flush({
        id: 5,
        createdAt: new Date('2026-09-29T10:00:00Z'),
        updatedAt: new Date('2026-09-29T10:00:00Z'),
        finishedAt: new Date('2026-09-29T10:00:00Z'),
        failedAt: null,
        matchingCount: 42,
      } satisfies MatchingRunDTO);
    httpTesting
      .expectOne({ method: 'GET', url: '/api/matchings/runs/newest' })
      .flush(null, { status: 404, statusText: 'Not Found' });
    await localFixture.whenStable();
    localFixture.detectChanges();

    const lastRunText = (
      localFixture.nativeElement.querySelector(
        '.matching-run__last-run',
      ) as HTMLElement
    ).textContent?.trim();
    expect(lastRunText).toContain('29.09.2026');
    expect(lastRunText).toContain('42 Matchings');
  });

  it('shows the button as busy on load when a run is already in progress (e.g. after a page reload)', async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
    });

    const localFixture = TestBed.createComponent(MatchingRunComponent);
    const localButton = () =>
      localFixture.nativeElement.querySelector(
        '.matching-run__button',
      ) as HTMLButtonElement;

    httpTesting
      .expectOne({ method: 'GET', url: '/api/matchings/runs/latest' })
      .flush(null, { status: 404, statusText: 'Not Found' });
    httpTesting
      .expectOne({ method: 'GET', url: '/api/matchings/runs/newest' })
      .flush({
        id: 9,
        createdAt: new Date('2026-09-30T10:00:00Z'),
        updatedAt: new Date('2026-09-30T10:00:00Z'),
        finishedAt: null,
        failedAt: null,
        matchingCount: 0,
      } satisfies MatchingRunDTO);
    await vi.advanceTimersByTimeAsync(0);
    localFixture.detectChanges();

    expect(localButton().disabled).toBe(true);
    expect(
      localFixture.nativeElement.querySelector('.loading-spinner'),
    ).toBeTruthy();

    // it finishes shortly after: polling should still pick it up and re-enable the button
    await vi.advanceTimersByTimeAsync(2000);
    httpTesting
      .expectOne({ method: 'GET', url: '/api/matchings/runs/9' })
      .flush({
        id: 9,
        createdAt: new Date('2026-09-30T10:00:00Z'),
        updatedAt: new Date('2026-09-30T10:00:00Z'),
        finishedAt: new Date('2026-09-30T10:00:05Z'),
        failedAt: null,
        matchingCount: 5,
      } satisfies MatchingRunDTO);
    await vi.advanceTimersByTimeAsync(0);
    localFixture.detectChanges();

    expect(localButton().disabled).toBe(false);
  });
});
