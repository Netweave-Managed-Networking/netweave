import {
  HttpClient,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { afterNextRender, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberEmailConfirmationDTO } from '@netweave/api-types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-member-email-confirm',
  templateUrl: './member-email-confirm.component.html',
})
export class MemberEmailConfirmComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  protected state = signal<'pending' | 'confirmed' | 'invalid' | 'taken'>(
    'pending',
  );

  public constructor() {
    // browser only: with SSR, a request from ngOnInit would also be sent by the server and use up the one-time token,
    // so the browser's own request would then fail as invalid
    afterNextRender(() => this.confirm());
  }

  private async confirm() {
    const dto: MemberEmailConfirmationDTO = {
      token: this.route.snapshot.paramMap.get('token') ?? '',
    };

    try {
      await firstValueFrom(this.http.post('/api/members/confirm-email', dto));
      this.state.set('confirmed');
    } catch (err) {
      const status = err instanceof HttpErrorResponse ? err.status : undefined;
      this.state.set(status === HttpStatusCode.Conflict ? 'taken' : 'invalid');
    }
  }
}
