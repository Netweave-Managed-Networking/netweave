import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  MemberChangeItemDTO,
  MemberChangesSinceMatchingDTO,
} from '@netweave/api-types';
import { catchError, of, take } from 'rxjs';

/** how many organizations joined or changed their data since the latest matching run, to judge whether a new one pays off */
@Component({
  selector: 'app-member-changes',
  templateUrl: './member-changes.component.html',
})
export class MemberChangesComponent {
  private http = inject(HttpClient);

  protected changes = signal<MemberChangesSinceMatchingDTO | null>(null);

  public constructor() {
    this.reload();
  }

  /** e.g. after a matching run finished, which resets what counts as new */
  public reload() {
    this.http
      .get<MemberChangesSinceMatchingDTO>('/api/matchings/member-changes')
      .pipe(
        take(1),
        catchError(() => of(null)), // a transient error: leave the section empty
      )
      .subscribe((changes) => this.changes.set(changes));
  }

  protected names(members: MemberChangeItemDTO[]): string {
    return members.map(({ name }) => name).join(', ');
  }
}
