import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatchingRunDTO } from '@netweave/api-types';
import { catchError, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';

@Component({
  selector: 'app-matching-run',
  templateUrl: './matching-run.component.html',
  styleUrls: ['./matching-run.component.scss'],
})
export class MatchingRunComponent {
  private http = inject(HttpClient);

  protected runState = signal<LoadingState>('initial');
  protected alreadyRunning = signal(false);
  protected lastRun = signal<MatchingRunDTO | null>(null);

  protected run() {
    this.runState.set('pending');
    this.alreadyRunning.set(false);

    this.http
      .post<MatchingRunDTO>('/api/matchings/runs', {})
      .pipe(
        take(1),
        tap((run) => {
          this.lastRun.set(run);
          this.runState.set('success');
        }),
        catchError((error: HttpErrorResponse) => {
          this.alreadyRunning.set(error.status === 409);
          this.runState.set('error');
          return of(null);
        }),
      )
      .subscribe();
  }
}
