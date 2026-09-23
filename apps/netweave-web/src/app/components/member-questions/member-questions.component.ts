import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import {
  InvitationTokenDTO,
  MemberUpsertDTO,
  RESOURCE_REQUIREMENT_CATEGORIES,
  ResourceRequirementCategory,
} from '@netweave/api-types';
import { catchError, firstValueFrom, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';
import { RESOURCE_REQUIREMENT_CATEGORY_TEXTS } from './resource-requirement-categories';

interface MemberFormModel {
  name: string;
  contact: string;
  resourcesRequirements: Record<
    ResourceRequirementCategory,
    { resources: string; requirements: string }
  >;
}

// form fields need strings, while the API uses null for empty values

const toMemberFormModel = (member: MemberUpsertDTO | null): MemberFormModel => {
  const saved = new Map(
    member?.resourcesRequirements.map((item) => [item.category, item]),
  );

  const resourcesRequirements = Object.fromEntries(
    RESOURCE_REQUIREMENT_CATEGORIES.map((category) => [
      category,
      {
        resources: saved.get(category)?.resources ?? '',
        requirements: saved.get(category)?.requirements ?? '',
      },
    ]),
  ) as MemberFormModel['resourcesRequirements']; // fromEntries loses the key type

  return {
    name: member?.name ?? '',
    contact: member?.contact ?? '',
    resourcesRequirements,
  };
};

const toMemberUpsertDTO = ({
  name,
  contact,
  resourcesRequirements,
}: MemberFormModel): MemberUpsertDTO => ({
  name,
  contact: contact || null,
  resourcesRequirements: RESOURCE_REQUIREMENT_CATEGORIES.map((category) => ({
    category,
    resources: resourcesRequirements[category].resources || null,
    requirements: resourcesRequirements[category].requirements || null,
  })),
});

@Component({
  selector: 'app-member-questions',
  imports: [FormField],
  templateUrl: './member-questions.component.html',
})
export class MemberQuestionsComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  private token = this.route.snapshot.paramMap.get('token') ?? '';

  protected readonly categories = RESOURCE_REQUIREMENT_CATEGORIES;
  protected readonly categoryTexts = RESOURCE_REQUIREMENT_CATEGORY_TEXTS;

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
