import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { CULTURE_ORIENTATIONS, CULTURE_TOPICS } from '@netweave/api-types';
import { PriorityRankerComponent } from '../../priority-ranker/priority-ranker.component';
import { CultureWeightsModel } from '../member-form.model';
import { CULTURE_TOPIC_TEXTS } from './culture-topics';

/** muted on purpose, signal colours like red or green would read as a rating */
const STATEMENT_MARKER_COLORS = [
  '#C78A8F', // Altrosa
  '#4A8C8C', // Petrol
  '#A07A1E', // Ocker
  '#8F7BA8', // Flieder
];

@Component({
  selector: 'app-member-culture',
  imports: [FormField, PriorityRankerComponent],
  templateUrl: './member-culture.component.html',
})
export class MemberCultureComponent {
  public readonly fields = input.required<FieldTree<CultureWeightsModel>>();

  /** assigned by the shuffled start order, so they give no hint at the orientation */
  protected readonly markerColors = STATEMENT_MARKER_COLORS;

  protected readonly cultureTopics = CULTURE_TOPICS.map((topic) => ({
    topic,
    label: CULTURE_TOPIC_TEXTS[topic].label,
    statements: CULTURE_ORIENTATIONS.map((orientation) => ({
      id: orientation,
      html: CULTURE_TOPIC_TEXTS[topic].statements[orientation],
    })),
  }));
}
