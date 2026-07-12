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
import { UserInvitationCreateComponent } from '../user-invitation-create/user-invitation-create.component';
import { UserInvitationDeleteComponent } from '../user-invitation-delete/user-invitation-delete.component';

@Component({
  selector: 'app-user-invitations',
  imports: [UserInvitationCreateComponent, UserInvitationDeleteComponent],
  templateUrl: './user-invitations.component.html',
  styleUrls: ['./user-invitations.component.scss'],
})
export class UserInvitationsComponent {
  private http = inject(HttpClient);

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
