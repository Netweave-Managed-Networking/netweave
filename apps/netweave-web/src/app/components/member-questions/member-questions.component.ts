import {
  HttpClient,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { form, required, validate } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { InvitationTokenDTO } from '@netweave/api-types';
import { isEmail } from 'class-validator';
import { catchError, firstValueFrom, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';
import {
  MemberFormModel,
  toMemberFormModel,
  toMemberUpsertDTO,
} from './member-form.model';
import { MemberCultureComponent } from './member-culture/member-culture.component';
import { MemberGeneralDataComponent } from './member-general-data/member-general-data.component';
import { MemberResourcesRequirementsComponent } from './member-resources-requirements/member-resources-requirements.component';
import { MemberWorldviewComponent } from './member-worldview/member-worldview.component';

@Component({
  selector: 'app-member-questions',
  imports: [
    MemberGeneralDataComponent,
    MemberResourcesRequirementsComponent,
    MemberCultureComponent,
    MemberWorldviewComponent,
  ],
  templateUrl: './member-questions.component.html',
})
export class MemberQuestionsComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  private token = this.route.snapshot.paramMap.get('token') ?? '';

  protected saveState = signal<LoadingState>('initial');
  protected saveError = signal('');

  protected invitation = resource({
    loader: () =>
      firstValueFrom(
        this.http
          .get<InvitationTokenDTO>(`/api/invitations/by-token/${this.token}`)
          .pipe(catchError(() => of(null))),
      ),
  });

  protected memberModel = signal<MemberFormModel>(toMemberFormModel(null));

  protected memberForm = form(this.memberModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Bitte den Namen der Organisation angeben.',
    });
    required(schemaPath.email, { message: 'Bitte eine Email angeben.' });
    validate(schemaPath.email, ({ value }) =>
      !value() || isEmail(value().trim())
        ? null
        : { kind: 'email', message: 'Ungültiges Email-Format.' },
    );
  });

  protected canSave = computed(
    () =>
      !!this.invitation.value() &&
      !this.memberForm().invalid() &&
      this.saveState() !== 'pending',
  );

  public constructor() {
    effect(() => {
      const invitation = this.invitation.value();
      if (!invitation) return;

      this.memberModel.set(toMemberFormModel(invitation));
    });
  }

  protected submit() {
    if (!this.canSave()) return;

    this.saveState.set('pending');

    const memberUpsertDTO = toMemberUpsertDTO(this.memberModel());

    this.http
      .put<InvitationTokenDTO>(
        `/api/members/by-token/${this.token}`,
        memberUpsertDTO,
      )
      .pipe(
        take(1),
        tap((saved) => {
          // brings in the pending email, so its hint shows up
          this.invitation.set(saved);
          this.saveState.set('success');
        }),
        catchError((err: unknown) => {
          this.saveError.set(toSaveErrorMessage(err));
          this.saveState.set('error');
          return of(null);
        }),
      )
      .subscribe();
  }
}

function toSaveErrorMessage(err: unknown): string {
  const status = err instanceof HttpErrorResponse ? err.status : undefined;

  if (status === HttpStatusCode.Conflict)
    return 'Speichern fehlgeschlagen: Diese Email wird bereits von einer anderen Organisation verwendet.';

  if (status === HttpStatusCode.ServiceUnavailable)
    return 'Speichern fehlgeschlagen: Die Bestätigungsmail an die neue Email konnte nicht gesendet werden. Bitte versuche es später erneut.';

  return 'Speichern fehlgeschlagen.';
}
