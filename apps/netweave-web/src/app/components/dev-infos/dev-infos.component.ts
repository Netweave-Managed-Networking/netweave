import { HttpClient } from '@angular/common/http';
import { Component, inject, resource, ChangeDetectionStrategy } from '@angular/core';
import { MemberDTO } from '@netweave/api-types';
import { catchError, firstValueFrom, of } from 'rxjs';

@Component({
  selector: 'app-dev-infos',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './dev-infos.component.html',
})
export class DevInfosComponent {
  private http = inject(HttpClient);

  protected memberLatest = resource({
    loader: () =>
      firstValueFrom(
        this.http
          .get<MemberDTO | null>('/api/members/latest')
          .pipe(catchError(() => of(null))),
      ),
  });
}
