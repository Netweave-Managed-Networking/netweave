import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { CULTURE_ORIENTATIONS, CULTURE_TOPICS } from '@netweave/api-types';
import { PriorityRankerComponent } from '../../priority-ranker/priority-ranker.component';
import { CultureWeightsModel } from '../member-form.model';
import { CULTURE_TOPIC_TEXTS } from './culture-topics';

@Component({
  selector: 'app-member-culture',
  imports: [FormField, PriorityRankerComponent],
  templateUrl: './member-culture.component.html',
})
export class MemberCultureComponent {
  public readonly fields = input.required<FieldTree<CultureWeightsModel>>();

  protected readonly cultureTopics = CULTURE_TOPICS.map((topic) => ({
    topic,
    label: CULTURE_TOPIC_TEXTS[topic].label,
    statements: CULTURE_ORIENTATIONS.map((orientation) => ({
      id: orientation,
      html: CULTURE_TOPIC_TEXTS[topic].statements[orientation],
    })),
  }));
}
