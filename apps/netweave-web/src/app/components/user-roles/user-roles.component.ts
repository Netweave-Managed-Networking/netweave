import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  resource,
  ResourceRef,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  USER_ROLES,
  UserDTO,
  UserRole,
  UserRoleUpdateDTO,
} from '@netweave/api-types';

import { catchError, finalize, firstValueFrom, of, take, tap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { USER_ROLE_LABELS } from '../../types/user-role-labels';

type Toast = { kind: 'success' | 'error'; message: string };

const TOAST_DURATION_MS = 3000;

@Component({
  selector: 'app-user-roles',
  imports: [DatePipe],
  templateUrl: './user-roles.component.html',
})
export class UserRolesComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  protected readonly roles = USER_ROLES;
  protected readonly roleLabels = USER_ROLE_LABELS;

  protected users = computed(() => this.usersResponse.value());

  protected currentUserId = computed(() => {
    const me = this.authService.me();
    return me === 'unauthenticated' ? null : me.id;
  });

  /** roles selected in the UI but not yet saved, keyed by user id */
  protected selectedRoles = signal<Record<UserDTO['id'], UserRole>>({});
  protected pendingUserId = signal<UserDTO['id'] | null>(null);
  protected toast = signal<Toast | null>(null);
  private toastTimeout?: ReturnType<typeof setTimeout>;

  private usersResponse: ResourceRef<UserDTO[] | undefined> = resource({
    loader: () =>
      firstValueFrom(
        this.http.get<UserDTO[]>('/api/users').pipe(catchError(() => of([]))),
      ),
  });

  protected selectedRole(user: UserDTO): UserRole {
    return this.selectedRoles()[user.id] ?? user.role;
  }

  protected isDirty(user: UserDTO): boolean {
    return this.selectedRole(user) !== user.role;
  }

  protected selectRole(user: UserDTO, role: string) {
    this.selectedRoles.update((selected) => ({
      ...selected,
      // safe cast: the <option> values are generated from USER_ROLES
      [user.id]: role as UserRole,
    }));
  }

  protected save(user: UserDTO) {
    const dto: UserRoleUpdateDTO = { role: this.selectedRole(user) };
    this.pendingUserId.set(user.id);

    this.http
      .patch<UserDTO>(`/api/users/${user.id}/role`, dto)
      .pipe(
        take(1),
        tap((updated) => {
          this.usersResponse.update((items) =>
            items?.map((i) => (i.id === updated.id ? updated : i)),
          );
          this.discardUnsavedRole(user.id);
          this.showToast({
            kind: 'success',
            message: `Rolle von ${updated.email} auf ${USER_ROLE_LABELS[updated.role]} geändert.`,
          });
        }),
        catchError(() => {
          this.showToast({
            kind: 'error',
            message: `Rolle von ${user.email} konnte nicht geändert werden.`,
          });
          return of(null);
        }),
        finalize(() => this.pendingUserId.set(null)),
      )
      .subscribe();
  }

  private discardUnsavedRole(userId: UserDTO['id']) {
    this.selectedRoles.update((selected) => {
      const { [userId]: _, ...rest } = selected;
      return rest;
    });
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
