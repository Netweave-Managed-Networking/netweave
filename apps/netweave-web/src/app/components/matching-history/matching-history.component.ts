import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  resource,
  ResourceRef,
  signal,
} from '@angular/core';
import {
  MatchingRunDTO,
  MatchingRunListItemDTO,
  PaginatedDTO,
} from '@netweave/api-types';
import { IconPlus } from '@netweave/icons';
import { catchError, finalize, firstValueFrom, of, take } from 'rxjs';

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 2000; // how often to refresh while a run on the page is still in progress

type RunStatus = 'success' | 'failed' | 'cancelled' | 'pending';

interface StatusConfig {
  label: string;
  colorClass: string;
}

const STATUS_CONFIG: Record<RunStatus, StatusConfig> = {
  success: { label: 'Abgeschlossen', colorClass: 'status-success' },
  failed: { label: 'Fehlgeschlagen', colorClass: 'status-error' },
  cancelled: { label: 'Abgebrochen', colorClass: 'status-neutral' },
  pending: { label: 'Läuft', colorClass: 'status-warning' },
};

const statusOf = (run: MatchingRunListItemDTO): RunStatus => {
  if (run.failedAt) return 'failed';
  if (run.cancelledAt) return 'cancelled';
  if (run.finishedAt) return 'success';
  return 'pending';
};

/** null while the run is still in progress */
const durationOf = (run: MatchingRunListItemDTO): string | null => {
  const endedAt = run.finishedAt ?? run.failedAt ?? run.cancelledAt;
  if (!endedAt) return null;

  const ms = new Date(endedAt).getTime() - new Date(run.createdAt).getTime();
  if (ms < 1000) return `${ms} ms`;

  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
};

@Component({
  selector: 'app-matching-history',
  imports: [DatePipe, IconPlus],
  templateUrl: './matching-history.component.html',
  styleUrls: ['./matching-history.component.scss'],
})
export class MatchingHistoryComponent {
  private http = inject(HttpClient);

  protected readonly statusConfig = STATUS_CONFIG;
  protected readonly statusOf = statusOf;
  protected readonly durationOf = durationOf;

  protected page = signal(1);
  protected cancellingId = signal<number | null>(null);
  protected starting = signal(false);
  protected startFailed = signal(false);

  private historyResponse: ResourceRef<
    PaginatedDTO<MatchingRunListItemDTO> | undefined
  > = resource({
    params: () => ({ page: this.page() }),
    loader: ({ params }) =>
      firstValueFrom(
        this.http
          .get<PaginatedDTO<MatchingRunListItemDTO>>('/api/matchings/runs', {
            params: { page: params.page, pageSize: PAGE_SIZE },
          })
          .pipe(catchError(() => of(undefined))),
      ),
  });

  // only a fresh load, not a reload after cancelling, so the list stays in place meanwhile
  protected loading = computed(
    () => this.historyResponse.status() === 'loading',
  );
  protected runs = computed(() => this.historyResponse.value()?.items ?? []);
  protected hasRunInProgress = computed(() =>
    this.runs().some((run) => statusOf(run) === 'pending'),
  );

  public constructor() {
    // keeps the status of a running run current; each finished reload schedules the next one
    effect((onCleanup) => {
      if (!this.hasRunInProgress() || this.historyResponse.isLoading()) return;
      const timeout = setTimeout(
        () => this.historyResponse.reload(),
        POLL_INTERVAL_MS,
      );
      onCleanup(() => clearTimeout(timeout));
    });
  }

  protected totalPages = computed(() => {
    const total = this.historyResponse.value()?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  });

  // only offered on the first page, where the reload shows the new run as the newest one; a run some other
  // trigger started meanwhile (409) shows up there just the same, so that needs no message of its own
  protected start() {
    this.starting.set(true);
    this.startFailed.set(false);

    this.http
      .post<MatchingRunDTO>('/api/matchings/runs', {})
      .pipe(
        take(1),
        catchError((error: HttpErrorResponse) => {
          this.startFailed.set(error.status !== 409);
          return of(null);
        }),
        finalize(() => {
          this.starting.set(false);
          this.historyResponse.reload();
        }),
      )
      .subscribe();
  }

  // reloads either way: on success to show the run as cancelled, on failure (e.g. a 409 because it ended
  // meanwhile) to show how it really ended
  protected cancel(runId: number) {
    this.cancellingId.set(runId);

    this.http
      .post<MatchingRunDTO>(`/api/matchings/runs/${runId}/cancel`, {})
      .pipe(
        take(1),
        catchError(() => of(null)),
        finalize(() => {
          this.cancellingId.set(null);
          this.historyResponse.reload();
        }),
      )
      .subscribe();
  }

  protected previousPage() {
    this.page.update((page) => Math.max(1, page - 1));
  }

  protected nextPage() {
    this.page.update((page) => Math.min(this.totalPages(), page + 1));
  }
}
