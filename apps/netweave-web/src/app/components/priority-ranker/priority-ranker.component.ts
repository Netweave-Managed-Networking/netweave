import {
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import {
  dragTo,
  nudge,
  priorityOf,
  PriorityWeights,
  RankerStatement,
  RankItem,
  shuffle,
  stackedLayout,
  TrackSize,
  weightedLayout,
  weightsOf,
} from './priority-ranker.layout';

const SIZE: TrackSize = { trackHeight: 560, boxHeight: 88 };

/** priority points a keyboard step moves, with and without shift */
const KEY_STEP = 1;
const KEY_STEP_LARGE = 10;

const sameWeights = (a: PriorityWeights, b: PriorityWeights) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([id, weight]) => b[id] === weight);

/**
 * Vertical track to prioritize statements relative to each other: dragging a box up or down sets both its rank and
 * its weight (0–100). Boxes cannot overlap, so they stick to a neighbour, and swap with it when dragged past its
 * midpoint. The value stays null until the first move, as the initial stack in the middle is no answer.
 *
 * Statement ids are only used internally and never rendered, so they may carry meaning the user must not see.
 */
@Component({
  selector: 'app-priority-ranker',
  templateUrl: './priority-ranker.component.html',
})
export class PriorityRankerComponent
  implements FormValueControl<PriorityWeights | null>
{
  public readonly statements = input.required<readonly RankerStatement[]>();
  public readonly value = model<PriorityWeights | null>(null);

  protected readonly size = SIZE;

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  /** follows the value, unless it only reflects the current layout (re-placing from rounded weights would make boxes jump) */
  protected readonly items = linkedSignal<
    { statements: readonly RankerStatement[]; value: PriorityWeights | null },
    RankItem[]
  >({
    source: () => ({ statements: this.statements(), value: this.value() }),
    computation: ({ statements, value }, previous) => {
      if (
        previous?.source.statements === statements &&
        value &&
        sameWeights(weightsOf(previous.value, SIZE), value)
      ) {
        return previous.value;
      }

      return value
        ? weightedLayout(statements, value, SIZE)
        : stackedLayout(shuffle(statements), SIZE);
    },
  });

  protected readonly draggingId = signal<string | null>(null);
  protected readonly showPriorities = computed(
    () => this.value() !== null || this.draggingId() !== null,
  );

  private grabOffset = 0;

  protected priorityOf(item: RankItem): number {
    return priorityOf(item.top, SIZE);
  }

  protected startDrag(event: PointerEvent, item: RankItem) {
    if (!event.isPrimary || event.button !== 0) return;

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.grabOffset = this.pointerY(event) - item.top;
    this.draggingId.set(item.id);
  }

  protected drag(event: PointerEvent) {
    const id = this.draggingId();
    if (!id) return;

    const pointerY = this.pointerY(event);
    this.items.update((items) =>
      dragTo(items, id, pointerY - this.grabOffset, pointerY, SIZE),
    );
  }

  protected endDrag() {
    if (!this.draggingId()) return;

    this.draggingId.set(null);
    this.commit();
  }

  protected onKeydown(event: KeyboardEvent, item: RankItem) {
    const direction =
      event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (!direction) return;

    event.preventDefault();
    const points = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const delta =
      (direction * points * (SIZE.trackHeight - SIZE.boxHeight)) / 100;

    this.items.update((items) => nudge(items, item.id, delta, SIZE));
    this.commit();
  }

  private commit() {
    this.value.set(weightsOf(this.items(), SIZE));
  }

  private pointerY(event: PointerEvent): number {
    return (
      event.clientY - this.track().nativeElement.getBoundingClientRect().top
    );
  }
}
