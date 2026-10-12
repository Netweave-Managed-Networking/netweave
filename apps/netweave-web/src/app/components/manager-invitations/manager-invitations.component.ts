import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  resource,
  ResourceRef,
  signal,
} from '@angular/core';
import {
  UserEmailWhitelistCreatedDTO,
  UserEmailWhitelistDTO,
} from '@netweave/api-types';

import { catchError, firstValueFrom, of } from 'rxjs';
import { USER_ROLE_LABELS } from '../../types/user-role-labels';
import { ManagerInvitationCreateComponent } from '../manager-invitation-create/manager-invitation-create.component';
import { ManagerInvitationDeleteComponent } from '../manager-invitation-delete/manager-invitation-delete.component';

type Toast = { kind: 'success' | 'error'; message: string };

const TOAST_DURATION_MS = 3000;

@Component({
  selector: 'app-manager-invitations',
  imports: [ManagerInvitationCreateComponent, ManagerInvitationDeleteComponent],
  templateUrl: './manager-invitations.component.html',
  styleUrls: ['./manager-invitations.component.scss'],
})
export class ManagerInvitationsComponent {
  private http = inject(HttpClient);

  protected readonly roleLabels = USER_ROLE_LABELS;

  protected toast = signal<Toast | null>(null);
  private toastTimeout?: ReturnType<typeof setTimeout>;

  protected userEmailWhitelists = computed(() =>
    this.userEmailWhitelistsResponse.value(),
  );

  private userEmailWhitelistsResponse: ResourceRef<
    UserEmailWhitelistDTO[] | never[] | undefined
  > = resource({
    loader: () =>
      firstValueFrom(
        this.http
          .get<UserEmailWhitelistDTO[]>('/api/user-email-whitelists')
          .pipe(catchError(() => of([]))),
      ),
  });

  protected addToUserEmailWhitelistsResponse({
    invitationMailSent,
    ...entity
  }: UserEmailWhitelistCreatedDTO) {
    this.userEmailWhitelistsResponse.update((items) =>
      items ? [entity, ...items] : items,
    );

    // null: domain entries receive no invitation mail
    if (invitationMailSent === true)
      this.showToast({
        kind: 'success',
        message: `Einladung an ${entity.emailOrDomain} versendet.`,
      });
    if (invitationMailSent === false)
      this.showToast({
        kind: 'error',
        message: `${entity.emailOrDomain} wurde zugelassen, die Einladungsmail konnte aber nicht versendet werden.`,
      });
  }

  protected removeFromUserEmailWhitelistsResponse(
    id: UserEmailWhitelistDTO['id'],
  ) {
    this.userEmailWhitelistsResponse.update((items) =>
      items ? items.filter((i) => i.id !== id) : items,
    );
  }

  private showToast(toast: Toast) {
    clearTimeout(this.toastTimeout);
    this.toast.set(toast);
    this.toastTimeout = setTimeout(
      () => this.toast.set(null),
      TOAST_DURATION_MS,
    );
  }
}
