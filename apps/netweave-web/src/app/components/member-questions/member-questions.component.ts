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
  CULTURE_ORIENTATIONS,
  CULTURE_TOPICS,
  CultureTopic,
  InvitationTokenDTO,
  MemberUpsertDTO,
  parseCultureItemId,
  RESOURCE_REQUIREMENT_CATEGORIES,
  ResourceRequirementCategory,
  toCultureItemId,
} from '@netweave/api-types';
import { catchError, firstValueFrom, of, take, tap } from 'rxjs';
import { LoadingState } from '../../types/loading-state.type';
import { PriorityRankerComponent } from '../priority-ranker/priority-ranker.component';
import { PriorityWeights } from '../priority-ranker/priority-ranker.layout';
import { CULTURE_TOPIC_TEXTS } from './culture-topics';
import { RESOURCE_REQUIREMENT_CATEGORY_TEXTS } from './resource-requirement-categories';

interface MemberFormModel {
  name: string;
  contact: string;
  resourcesRequirements: Record<
    ResourceRequirementCategory,
    { resources: string; requirements: string }
  >;
  /** null while unanswered */
  cultureWeights: Record<CultureTopic, PriorityWeights | null>;
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

  const savedWeights = (member?.cultureWeights ?? []).map(
    ({ itemId, weight }) => ({ ...parseCultureItemId(itemId), weight }),
  );

  const topicWeights = (topic: CultureTopic): PriorityWeights | null => {
    const saved = savedWeights.filter((item) => item.topic === topic);
    if (saved.length === 0) return null;

    return Object.fromEntries(
      saved.map(({ orientation, weight }) => [orientation, weight]),
    );
  };

  const cultureWeights = Object.fromEntries(
    CULTURE_TOPICS.map((topic) => [topic, topicWeights(topic)]),
  ) as MemberFormModel['cultureWeights']; // fromEntries loses the key type

  return {
    name: member?.name ?? '',
    contact: member?.contact ?? '',
    resourcesRequirements,
    cultureWeights,
  };
};

const toMemberUpsertDTO = ({
  name,
  contact,
  resourcesRequirements,
  cultureWeights,
}: MemberFormModel): MemberUpsertDTO => ({
  name,
  contact: contact || null,
  resourcesRequirements: RESOURCE_REQUIREMENT_CATEGORIES.map((category) => ({
    category,
    resources: resourcesRequirements[category].resources || null,
    requirements: resourcesRequirements[category].requirements || null,
  })),
  // unanswered topics are left out, so their stored weights are kept
  cultureWeights: CULTURE_TOPICS.flatMap((topic) => {
    const weights = cultureWeights[topic];
    if (!weights) return [];

    return CULTURE_ORIENTATIONS.map((orientation) => ({
      itemId: toCultureItemId(topic, orientation),
      weight: weights[orientation],
    }));
  }),
});

@Component({
  selector: 'app-member-questions',
  imports: [FormField, PriorityRankerComponent],
  templateUrl: './member-questions.component.html',
})
export class MemberQuestionsComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  private token = this.route.snapshot.paramMap.get('token') ?? '';

  protected readonly categories = RESOURCE_REQUIREMENT_CATEGORIES;
  protected readonly categoryTexts = RESOURCE_REQUIREMENT_CATEGORY_TEXTS;

  protected readonly cultureTopics = CULTURE_TOPICS.map((topic) => ({
    topic,
    label: CULTURE_TOPIC_TEXTS[topic].label,
    statements: CULTURE_ORIENTATIONS.map((orientation) => ({
      id: orientation,
      text: CULTURE_TOPIC_TEXTS[topic].statements[orientation],
    })),
  }));

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
