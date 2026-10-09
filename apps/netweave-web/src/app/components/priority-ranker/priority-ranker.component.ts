import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
  viewChildren,
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

const TRACK_HEIGHT = 560;
/** used until the texts are measured, e.g. during SSR */
const FALLBACK_BOX_HEIGHT = 88;
/** py-2 and border of the box */
const BOX_PADDING_Y = 8;
const BOX_BORDER = 1;
/** the priority badge must fit even next to a one-line text */
const MIN_CONTENT_HEIGHT = 24;

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

  /** boxes are as high as the longest text needs, so more of the track is left for weighting */
  protected readonly size = signal<TrackSize>(
    { trackHeight: TRACK_HEIGHT, boxHeight: FALLBACK_BOX_HEIGHT },
    { equal: (a, b) => a.boxHeight === b.boxHeight },
  );

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly texts = viewChildren<ElementRef<HTMLElement>>('text');

  protected readonly items = linkedSignal<
    {
      statements: readonly RankerStatement[];
      value: PriorityWeights | null;
      size: TrackSize;
    },
    RankItem[]
  >({
    source: () => ({
      statements: this.statements(),
      value: this.value(),
      size: this.size(),
    }),
    computation: ({ statements, value, size }, previous) => {
      const sameStatements = previous?.source.statements === statements;

      // our own commits must not re-place the boxes, rounding would make them jump
      const showsValue =
        sameStatements &&
        previous.source.size === size &&
        value !== null &&
        sameWeights(weightsOf(previous.value, size), value);

      if (showsValue) return previous.value;
      if (value) return weightedLayout(statements, value, size);
      // a resize must not reshuffle the unranked boxes
      if (sameStatements) return stackedLayout(byTop(previous.value), size);
      return stackedLayout(shuffle(statements), size);
    },
  });

  protected readonly draggingId = signal<string | null>(null);
  protected readonly showPriorities = computed(
    () => this.value() !== null || this.draggingId() !== null,
  );

  private grabOffset = 0;
  private itemsBeforeDrag: RankItem[] = [];

  public constructor() {
    // texts wrap differently with the width, so their height is observed
    afterRenderEffect((onCleanup) => {
      const texts = this.texts().map((text) => text.nativeElement);
      if (typeof ResizeObserver === 'undefined') return;

      const observer = new ResizeObserver(() => this.fitBoxHeight(texts));
      texts.forEach((text) => observer.observe(text));
      onCleanup(() => observer.disconnect());
    });
  }

  protected priorityOf(item: RankItem): number {
    return priorityOf(item.top, this.size());
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
      dragTo(items, id, pointerY - this.grabOffset, pointerY, this.size()),
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
    const delta = pointsToPx(direction * points, this.size());

    this.items.update((items) => nudge(items, item.id, delta, this.size()));
    this.commit();
  }

  private commit() {
    this.value.set(weightsOf(this.items(), this.size()));
  }

  private fitBoxHeight(texts: readonly HTMLElement[]) {
    const textHeight = Math.max(
      ...texts.map((text) => text.getBoundingClientRect().height),
    );
    if (!textHeight) return; // not rendered yet

    const contentHeight = Math.max(Math.ceil(textHeight), MIN_CONTENT_HEIGHT);
    const boxHeight = contentHeight + 2 * (BOX_PADDING_Y + BOX_BORDER);
    this.size.set({ trackHeight: TRACK_HEIGHT, boxHeight });
  }

  private pointerY(event: PointerEvent): number {
    const trackTop = this.track().nativeElement.getBoundingClientRect().top;
    return event.clientY - trackTop;
  }
}

const byTop = (items: readonly RankItem[]) =>
  [...items].sort((a, b) => a.top - b.top);

const sameWeights = (a: PriorityWeights, b: PriorityWeights) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([id, weight]) => b[id] === weight);
