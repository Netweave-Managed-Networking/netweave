import { HttpClient } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { UserEmailWhitelistDTO } from '@netweave/api-types';

import { IconTrash } from '@netweave/icons';
import { catchError, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';

@Component({
  selector: 'app-user-invitation-delete',
  imports: [IconTrash],
  templateUrl: './user-invitation-delete.component.html',
  styleUrls: ['./user-invitation-delete.component.scss'],
})
export class UserInvitationDeleteComponent {
  private http = inject(HttpClient);

  public toDelete = input.required<UserEmailWhitelistDTO>();
  public deleted = output<UserEmailWhitelistDTO['id']>();
  private loadingState = signal<LoadingState>('initial');

  protected async submit(dialog: HTMLDialogElement) {
    this.loadingState.set('pending');

    this.http
      .delete<true>(`/api/user-email-whitelists/${this.toDelete().id}`)
      .pipe(
        take(1),
        tap(() => {
          this.deleted.emit(this.toDelete().id);
          this.loadingState.set('success');
          dialog.close();
        }),
        catchError(() => (this.loadingState.set('error'), of(null))),
      )
      .subscribe();
  }
}
