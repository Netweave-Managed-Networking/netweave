import { HttpClient } from '@angular/common/http';
import { Component, inject, resource } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvitationTokenDTO } from '@netweave/api-types';
import { catchError, firstValueFrom, of } from 'rxjs';

@Component({
  selector: 'app-member-questions',
  imports: [],
  templateUrl: './member-questions.component.html',
})
export class MemberQuestionsComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  private token = this.route.snapshot.paramMap.get('token') ?? '';

  protected invitation = resource({
    loader: () =>
      firstValueFrom(
        this.http
          .get<InvitationTokenDTO>(`/api/invitations/by-token/${this.token}`)
          .pipe(catchError(() => of(null))),
      ),
  });
}
