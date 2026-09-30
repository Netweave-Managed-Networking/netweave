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
  protected lastRun = signal<MatchingRunDTO | null>(null);

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
        if (newest && newest.finishedAt === null && newest.failedAt === null) {
          this.runState.set('pending');
          this.pollUntilDone(newest.id);
        }
      });
  }

  protected run() {
    this.runState.set('pending');
    this.alreadyRunning.set(false);

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

  // the run was only just created when triggered, so poll for it to actually finish (or fail) in the background
  private pollUntilDone(runId: number) {
    interval(POLL_INTERVAL_MS)
      .pipe(
        switchMap(() =>
          this.http.get<MatchingRunDTO>(`/api/matchings/runs/${runId}`),
        ),
        filter((run) => run.finishedAt !== null || run.failedAt !== null),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (run) => {
          if (run.finishedAt) this.lastRun.set(run);
          this.runState.set(run.failedAt ? 'error' : 'success');
        },
        error: () => this.runState.set('error'),
      });
  }
}
