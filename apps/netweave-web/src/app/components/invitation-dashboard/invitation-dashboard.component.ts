import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
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
}

const STATUS_CONFIG: Record<InvitationDisplayStatus, StatusConfig> = {
  failed: { label: 'Fehlgeschlagen', colorClass: 'status-error', ping: true },
  pending: { label: 'Ausstehend', colorClass: 'status-warning', ping: false },
  answered: {
    label: 'Beantwortet',
    colorClass: 'status-success',
    ping: false,
  },
  dispatched: {
    label: 'Versendet',
    colorClass: 'status-info',
    ping: false,
  },
  expired: { label: 'Abgelaufen', colorClass: 'status-neutral', ping: false },
};

@Component({
  selector: 'app-invitation-dashboard',
  imports: [DatePipe],
  templateUrl: './invitation-dashboard.component.html',
})
export class InvitationDashboardComponent {
  private http = inject(HttpClient);

  protected readonly statusConfig = STATUS_CONFIG;

  protected invitations = computed(() => this.invitationsResponse.value());

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

  // Shared by the stat tiles above so each one only has to state its own status predicate.
  private countBy(predicate: (invitation: InvitationListItemDTO) => boolean) {
    return computed(
      () => (this.invitations() ?? []).filter(predicate).length,
    );
  }
}
