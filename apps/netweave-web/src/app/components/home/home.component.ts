import { HttpClient } from '@angular/common/http';
import { Component, inject, resource } from '@angular/core';
import { MemberDTO } from '@netweave/api-types';
import { catchError, firstValueFrom, of } from 'rxjs';
import { StatementRankerComponent } from '../statement-ranker/statement-ranker.component';

@Component({
  selector: 'app-home',
  imports: [StatementRankerComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
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
