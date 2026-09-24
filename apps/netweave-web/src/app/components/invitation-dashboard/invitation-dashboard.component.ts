import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  signal,
  resource,
  ResourceRef,
} from '@angular/core';
import {
  InvitationDisplayStatus,
  InvitationListItemDTO,
} from '@netweave/api-types';
import { catchError, firstValueFrom, of } from 'rxjs';

interface StatusConfig {
  label: string;
  colorClass: string;
  ping: boolean;
  /** position when sorting by status; mirrors STATUS_ORDER in the API's InvitationsService */
  order: number;
}

type SortColumn = 'email' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

const STATUS_CONFIG: Record<InvitationDisplayStatus, StatusConfig> = {
  failed: {
    label: 'Fehlgeschlagen',
    colorClass: 'status-error',
    ping: true,
    order: 0,
  },
  pending: {
    label: 'Ausstehend',
    colorClass: 'status-warning',
    ping: false,
    order: 1,
  },
  answered: {
    label: 'Beantwortet',
    colorClass: 'status-success',
    ping: false,
    order: 2,
  },
  dispatched: {
    label: 'Versendet',
    colorClass: 'status-info',
    ping: false,
    order: 3,
  },
  expired: {
    label: 'Abgelaufen',
    colorClass: 'status-neutral',
    ping: false,
    order: 4,
  },
};

const createdAtTime = (invitation: InvitationListItemDTO) =>
  new Date(invitation.createdAt).getTime();

const COMPARATORS: Record<
  SortColumn,
  (a: InvitationListItemDTO, b: InvitationListItemDTO) => number
> = {
  email: (a, b) => a.email.localeCompare(b.email),
  status: (a, b) =>
    STATUS_CONFIG[a.status].order - STATUS_CONFIG[b.status].order,
  createdAt: (a, b) => createdAtTime(a) - createdAtTime(b),
};

@Component({
  selector: 'app-invitation-dashboard',
  imports: [DatePipe],
  templateUrl: './invitation-dashboard.component.html',
})
export class InvitationDashboardComponent {
  private http = inject(HttpClient);

  protected readonly statusConfig = STATUS_CONFIG;

  protected readonly columns: {
    key: SortColumn;
    label: string;
    thClass: string;
  }[] = [
    { key: 'email', label: 'Email', thClass: 'invitation-dashboard__email-th' },
    {
      key: 'status',
      label: 'Status',
      thClass: 'invitation-dashboard__status-th',
    },
    {
      key: 'createdAt',
      label: 'Erstellt am',
      thClass: 'invitation-dashboard__created-at-th',
    },
  ];

  protected readonly sort = signal<SortState>({
    column: 'status',
    direction: 'asc',
  });

  protected invitations = computed(() => this.invitationsResponse.value());

  protected sortedInvitations = computed(() => {
    const invitations = this.invitations();
    if (!invitations) return invitations;

    const { column, direction } = this.sort();
    const sign = direction === 'asc' ? 1 : -1;
    // ties fall back to newest first, matching the order the API delivers
    return [...invitations].sort(
      (a, b) =>
        sign * COMPARATORS[column](a, b) || createdAtTime(b) - createdAtTime(a),
    );
  });

  private invitationsResponse: ResourceRef<
    InvitationListItemDTO[] | never[] | undefined
  > = resource({
    loader: () =>
      firstValueFrom(
        this.http
          .get<InvitationListItemDTO[]>('/api/invitations')
          .pipe(catchError(() => of([]))),
      ),
  });

  protected awaitingCount = this.countBy(
    (invitation) =>
      invitation.status === 'pending' || invitation.status === 'dispatched',
  );

  protected answeredCount = this.countBy(
    (invitation) => invitation.status === 'answered',
  );

  protected failedCount = this.countBy(
    (invitation) =>
      invitation.status === 'failed' || invitation.status === 'expired',
  );

  protected toggleSort(column: SortColumn) {
    this.sort.update((current) =>
      current.column === column
        ? { column, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' },
    );
  }

  protected ariaSort(column: SortColumn) {
    const { column: active, direction } = this.sort();
    if (active !== column) return 'none';
    return direction === 'asc' ? 'ascending' : 'descending';
  }

  // Shared by the stat tiles above so each one only has to state its own status predicate.
  private countBy(predicate: (invitation: InvitationListItemDTO) => boolean) {
    return computed(() => (this.invitations() ?? []).filter(predicate).length);
  }
}
