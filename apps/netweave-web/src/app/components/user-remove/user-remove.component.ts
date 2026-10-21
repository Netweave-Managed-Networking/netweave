import { HttpClient } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { UserDTO } from '@netweave/api-types';

import { IconTrash } from '@netweave/icons';
import { catchError, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';

@Component({
  selector: 'app-user-remove',
  imports: [IconTrash],
  templateUrl: './user-remove.component.html',
  styleUrls: ['./user-remove.component.scss'],
})
export class UserRemoveComponent {
  private http = inject(HttpClient);

  public toRemove = input.required<UserDTO>();
  public disabled = input(false);
  public removed = output<UserDTO>();
  protected loadingState = signal<LoadingState>('initial');

  protected submit(dialog: HTMLDialogElement) {
    this.loadingState.set('pending');

    this.http
      .delete<true>(`/api/users/${this.toRemove().id}`)
      .pipe(
        take(1),
        tap(() => {
          this.removed.emit(this.toRemove());
          this.loadingState.set('success');
          dialog.close();
        }),
        catchError(() => {
          this.loadingState.set('error');
          return of(null);
        }),
      )
      .subscribe();
  }
}
