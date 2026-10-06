import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  resource,
  ResourceRef,
} from '@angular/core';
import { UserEmailWhitelistDTO } from '@netweave/api-types';

import { catchError, firstValueFrom, of } from 'rxjs';
import { USER_ROLE_LABELS } from '../../types/user-role-labels';
import { ManagerInvitationCreateComponent } from '../manager-invitation-create/manager-invitation-create.component';
import { ManagerInvitationDeleteComponent } from '../manager-invitation-delete/manager-invitation-delete.component';

@Component({
  selector: 'app-manager-invitations',
  imports: [ManagerInvitationCreateComponent, ManagerInvitationDeleteComponent],
  templateUrl: './manager-invitations.component.html',
  styleUrls: ['./manager-invitations.component.scss'],
})
export class ManagerInvitationsComponent {
  private http = inject(HttpClient);

  protected readonly roleLabels = USER_ROLE_LABELS;

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

  protected addToUserEmailWhitelistsResponse(entity: UserEmailWhitelistDTO) {
    this.userEmailWhitelistsResponse.update((items) =>
      items ? [entity, ...items] : items,
    );
  }

  protected removeFromUserEmailWhitelistsResponse(
    id: UserEmailWhitelistDTO['id'],
  ) {
    this.userEmailWhitelistsResponse.update((items) =>
      items ? items.filter((i) => i.id !== id) : items,
    );
  }
}
