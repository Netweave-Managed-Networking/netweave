import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { InvitationTokenDTO, MemberUpsertDTO } from '@netweave/api-types';
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

@Component({
  selector: 'app-member-questions',
  imports: [
    MemberGeneralDataComponent,
    MemberResourcesRequirementsComponent,
    MemberCultureComponent,
  ],
  templateUrl: './member-questions.component.html',
})
export class MemberQuestionsComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  private token = this.route.snapshot.paramMap.get('token') ?? '';

  protected saveState = signal<LoadingState>('initial');

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
  });

  protected canSave = computed(
    () =>
      !!this.invitation.value() &&
      !this.memberForm().invalid() &&
      this.saveState() !== 'pending',
  );

  public constructor() {
    effect(() => {
      const member = this.invitation.value()?.member;
      if (!member) return;

      this.memberModel.set(toMemberFormModel(member));
    });
  }

  protected submit() {
    if (!this.canSave()) return;

    this.saveState.set('pending');

    const memberUpsertDTO = toMemberUpsertDTO(this.memberModel());

    this.http
      .put<MemberUpsertDTO>(
        `/api/members/by-token/${this.token}`,
        memberUpsertDTO,
      )
      .pipe(
        take(1),
        tap(() => this.saveState.set('success')),
        catchError(() => {
          this.saveState.set('error');
          return of(null);
        }),
      )
      .subscribe();
  }
}
