import { Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { LIKERT_ANSWERS, LIKERT_MAX, LikertAnswer } from '@netweave/api-types';

/** what follows "stimmt", per answer */
const LIKERT_LABELS: Record<LikertAnswer, string> = {
  0: 'nicht',
  1: 'wenig',
  2: 'mittelmäßig',
  3: 'ziemlich',
  4: 'sehr',
};

/** where the unanswered slider rests, so it leans to no side */
const UNANSWERED_POSITION = 2;

/** several questions are on one page, their text ids must not clash */
let nextInstance = 0;

/**
 * A statement rated on the fixed five-step Likert scale from "stimmt nicht" (0) to "stimmt sehr" (4).
 * The value stays null until the first answer.
 */
@Component({
  selector: 'app-likert-question',
  templateUrl: './likert-question.component.html',
})
export class LikertQuestionComponent
  implements FormValueControl<LikertAnswer | null>
{
  public readonly text = input.required<string>();
  public readonly value = model<LikertAnswer | null>(null);
  /** shown next to the statement, to tell the questions of a list apart */
  public readonly number = input<number | null>(null);

  protected readonly textId = `likert-question-${nextInstance++}-text`;

  protected readonly answered = computed(() => this.value() !== null);

  protected readonly steps = LIKERT_ANSWERS.map((answer) => ({
    answer,
    label: LIKERT_LABELS[answer],
    // ticks and labels sit where the slider stops, from 0% to 100% of its track
    position: (answer / LIKERT_MAX) * 100,
  }));

  protected readonly position = computed(
    () => this.value() ?? UNANSWERED_POSITION,
  );

  protected readonly valueText = computed(() => {
    const value = this.value();
    return value === null
      ? 'Noch nicht beantwortet'
      : `stimmt ${LIKERT_LABELS[value]}`;
  });

  /** also on click, as the unanswered slider fires no input event when clicked where it rests */
  protected selectFrom(event: Event): void {
    this.select(Number((event.target as HTMLInputElement).value));
  }

  protected select(answer: number): void {
    if (LIKERT_ANSWERS.includes(answer as LikertAnswer))
      this.value.set(answer as LikertAnswer);
  }
}
