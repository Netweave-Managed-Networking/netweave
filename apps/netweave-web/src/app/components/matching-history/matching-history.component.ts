import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  resource,
  ResourceRef,
  signal,
} from '@angular/core';
import { MatchingRunListItemDTO, PaginatedDTO } from '@netweave/api-types';
import { catchError, firstValueFrom, of } from 'rxjs';

const PAGE_SIZE = 20;

type RunStatus = 'success' | 'failed' | 'pending';

interface StatusConfig {
  label: string;
  colorClass: string;
}

const STATUS_CONFIG: Record<RunStatus, StatusConfig> = {
  success: { label: 'Abgeschlossen', colorClass: 'status-success' },
  failed: { label: 'Fehlgeschlagen', colorClass: 'status-error' },
  pending: { label: 'Läuft', colorClass: 'status-warning' },
};

const statusOf = (run: MatchingRunListItemDTO): RunStatus => {
  if (run.failedAt) return 'failed';
  if (run.finishedAt) return 'success';
  return 'pending';
};

/** null while the run is still in progress */
const durationOf = (run: MatchingRunListItemDTO): string | null => {
  const endedAt = run.finishedAt ?? run.failedAt;
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
  imports: [DatePipe],
  templateUrl: './matching-history.component.html',
})
export class MatchingHistoryComponent {
  private http = inject(HttpClient);

  protected readonly statusConfig = STATUS_CONFIG;
  protected readonly statusOf = statusOf;
  protected readonly durationOf = durationOf;

  protected page = signal(1);

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

  protected loading = computed(() => this.historyResponse.isLoading());
  protected runs = computed(() => this.historyResponse.value()?.items ?? []);

  protected totalPages = computed(() => {
    const total = this.historyResponse.value()?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  });

  protected previousPage() {
    this.page.update((page) => Math.max(1, page - 1));
  }

  protected nextPage() {
    this.page.update((page) => Math.min(this.totalPages(), page + 1));
  }
}
