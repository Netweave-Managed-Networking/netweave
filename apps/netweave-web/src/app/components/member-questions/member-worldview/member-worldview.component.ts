import { Component, computed, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import {
  VIEW_OF_ENVIRONMENT_ITEM_IDS,
  ViewOfNature,
} from '@netweave/api-types';
import { LikertQuestionComponent } from '../../likert-question/likert-question.component';
import { ViewOfEnvironmentAnswersModel } from '../member-form.model';
import { MemberViewOfNatureComponent } from './member-view-of-nature/member-view-of-nature.component';
import { VIEW_OF_ENVIRONMENT_STATEMENTS } from './view-of-environment-statements';

/** Ökologische Weltanschauung: Umweltanschauung and Naturanschauung */
@Component({
  selector: 'app-member-worldview',
  imports: [FormField, LikertQuestionComponent, MemberViewOfNatureComponent],
  templateUrl: './member-worldview.component.html',
})
export class MemberWorldviewComponent {
  public readonly viewOfEnvironment =
    input.required<FieldTree<ViewOfEnvironmentAnswersModel>>();
  public readonly viewOfNature =
    input.required<FieldTree<ViewOfNature | null>>();

  protected readonly viewOfEnvironmentQuestions =
    VIEW_OF_ENVIRONMENT_ITEM_IDS.map((itemId) => ({
      itemId,
      text: VIEW_OF_ENVIRONMENT_STATEMENTS[itemId],
    }));

  protected readonly viewOfEnvironmentAnswered = computed(
    () =>
      VIEW_OF_ENVIRONMENT_ITEM_IDS.filter(
        (itemId) => this.viewOfEnvironment()[itemId]().value() !== null,
      ).length,
  );
}
