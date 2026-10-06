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
  pointsToPx,
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

const KEY_DIRECTIONS: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };
const KEY_STEP_POINTS = 1;
const KEY_STEP_POINTS_SHIFT = 10;

/**
 * Drag statements up or down to set their priority relative to each other.
 * The value stays null until the first move. Statement ids are never rendered.
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

  protected readonly items = linkedSignal<
    { statements: readonly RankerStatement[]; value: PriorityWeights | null },
    RankItem[]
  >({
    source: () => ({ statements: this.statements(), value: this.value() }),
    computation: ({ statements, value }, previous) => {
      // our own commits must not re-place the boxes, rounding would make them jump
      const showsValue =
        previous?.source.statements === statements &&
        value !== null &&
        sameWeights(weightsOf(previous.value, SIZE), value);

      if (showsValue) return previous.value;
      if (value) return weightedLayout(statements, value, SIZE);
      return stackedLayout(shuffle(statements), SIZE);
    },
  });

  protected readonly draggingId = signal<string | null>(null);
  protected readonly showPriorities = computed(
    () => this.value() !== null || this.draggingId() !== null,
  );

  private grabOffset = 0;
  private itemsBeforeDrag: RankItem[] = [];

  protected priorityOf(item: RankItem): number {
    return priorityOf(item.top, SIZE);
  }

  protected startDrag(event: PointerEvent, item: RankItem) {
    if (!event.isPrimary || event.button !== 0) return;

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.grabOffset = this.pointerY(event) - item.top;
    this.itemsBeforeDrag = this.items();
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

    const moved = this.items() !== this.itemsBeforeDrag;
    if (moved) this.commit();
  }

  protected onKeydown(event: KeyboardEvent, item: RankItem) {
    const direction = KEY_DIRECTIONS[event.key];
    if (!direction) return;

    event.preventDefault();
    const points = event.shiftKey ? KEY_STEP_POINTS_SHIFT : KEY_STEP_POINTS;
    const delta = pointsToPx(direction * points, SIZE);

    this.items.update((items) => nudge(items, item.id, delta, SIZE));
    this.commit();
  }

  private commit() {
    this.value.set(weightsOf(this.items(), SIZE));
  }

  private pointerY(event: PointerEvent): number {
    const trackTop = this.track().nativeElement.getBoundingClientRect().top;
    return event.clientY - trackTop;
  }
}

const sameWeights = (a: PriorityWeights, b: PriorityWeights) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([id, weight]) => b[id] === weight);
