import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchingRunDTO } from '@netweave/api-types';
import { catchError, filter, interval, of, switchMap, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';

const POLL_INTERVAL_MS = 2000; // how often to check whether a triggered run has finished

@Component({
  selector: 'app-matching-run',
  imports: [DatePipe],
  templateUrl: './matching-run.component.html',
  styleUrls: ['./matching-run.component.scss'],
})
export class MatchingRunComponent {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  protected runState = signal<LoadingState>('initial');
  protected alreadyRunning = signal(false);
  protected cancelled = signal(false);
  protected cancelling = signal(false);
  protected lastRun = signal<MatchingRunDTO | null>(null);
  protected runningId = signal<number | null>(null); // the run being polled, known once it was created

  public constructor() {
    // shows when the last run finished even before anyone clicks the button on this page load
    this.http
      .get<MatchingRunDTO>('/api/matchings/runs/latest')
      .pipe(
        take(1),
        tap((run) => this.lastRun.set(run)),
        catchError(() => of(null)), // no run yet, or a transient error: leave the section empty
      )
      .subscribe();

    // a run (triggered manually or by the cron) may still be in progress from before this page was (re)loaded
    this.http
      .get<MatchingRunDTO>('/api/matchings/runs/newest')
      .pipe(
        take(1),
        catchError(() => of(null)), // no run yet, or a transient error: nothing to resume polling for
      )
      .subscribe((newest) => {
        if (newest && isInProgress(newest)) {
          this.runState.set('pending');
          this.pollUntilDone(newest.id);
        }
      });
  }

  protected run() {
    this.runState.set('pending');
    this.alreadyRunning.set(false);
    this.cancelled.set(false);

    this.http
      .post<MatchingRunDTO>('/api/matchings/runs', {})
      .pipe(
        take(1),
        catchError((error: HttpErrorResponse) => {
          this.alreadyRunning.set(error.status === 409);
          this.runState.set('error');
          return of(null);
        }),
      )
      .subscribe((started) => {
        if (started) this.pollUntilDone(started.id);
      });
  }

  // only asks the api to cancel; polling picks up that the run ended, also if it finished just before
  protected cancel() {
    const runId = this.runningId();
    if (runId === null) return;
    this.cancelling.set(true);

    this.http
      .post<MatchingRunDTO>(`/api/matchings/runs/${runId}/cancel`, {})
      .pipe(
        take(1),
        catchError(() => {
          this.cancelling.set(false); // e.g. a 409 if it ended meanwhile: polling shows how it ended
          return of(null);
        }),
      )
      .subscribe();
  }

  // the run was only just created when triggered, so poll for it to actually finish (or fail) in the background
  private pollUntilDone(runId: number) {
    this.runningId.set(runId);
    interval(POLL_INTERVAL_MS)
      .pipe(
        switchMap(() =>
          this.http.get<MatchingRunDTO>(`/api/matchings/runs/${runId}`).pipe(
            // a single transient failure (e.g. a 502 during a deploy) shouldn't stop polling for the run itself
            catchError(() => of(null)),
          ),
        ),
        filter(
          (run): run is MatchingRunDTO => run !== null && !isInProgress(run),
        ),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((run) => {
        this.runningId.set(null);
        this.cancelling.set(false);
        if (run.finishedAt) this.lastRun.set(run);
        if (run.cancelledAt) {
          this.cancelled.set(true);
          this.runState.set('initial');
        } else {
          this.runState.set(run.failedAt ? 'error' : 'success');
        }
      });
  }
}

const isInProgress = (run: MatchingRunDTO) =>
  run.finishedAt === null && run.failedAt === null && run.cancelledAt === null;
