export interface RankerStatement {
  id: string;
  /** rendered via innerHTML, so Angular sanitizes it */
  html: string;
}

/** 0 (bottom) to 100 (top) per statement id */
export type PriorityWeights = Record<string, number>;

export interface RankItem extends RankerStatement {
  top: number;
}

export interface TrackSize {
  trackHeight: number;
  boxHeight: number;
}

const maxTopOf = ({ trackHeight, boxHeight }: TrackSize) =>
  trackHeight - boxHeight;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const shuffle = <T>(items: readonly T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const priorityOf = (top: number, size: TrackSize): number =>
  Math.round((1 - top / maxTopOf(size)) * 100);

export const pointsToPx = (points: number, size: TrackSize): number =>
  (points * maxTopOf(size)) / 100;

export const weightsOf = (
  items: readonly RankItem[],
  size: TrackSize,
): PriorityWeights =>
  Object.fromEntries(
    items.map((item) => [item.id, priorityOf(item.top, size)]),
  );

export const stackedLayout = (
  statements: readonly RankerStatement[],
  size: TrackSize,
): RankItem[] => {
  const startTop = (size.trackHeight - statements.length * size.boxHeight) / 2;
  return statements.map((statement, i) => ({
    ...statement,
    top: startTop + i * size.boxHeight,
  }));
};

/** rounded weights can make flush boxes overlap slightly, so they get pushed apart */
export const weightedLayout = (
  statements: readonly RankerStatement[],
  weights: PriorityWeights,
  size: TrackSize,
): RankItem[] => {
  const maxTop = maxTopOf(size);
  const items = byTop(
    statements.map((statement) => ({
      ...statement,
      top: clamp((1 - (weights[statement.id] ?? 0) / 100) * maxTop, 0, maxTop),
    })),
  );

  for (let i = 1; i < items.length; i++) {
    items[i].top = Math.max(items[i].top, items[i - 1].top + size.boxHeight);
  }
  for (let i = items.length - 1; i >= 0; i--) {
    const limit =
      i === items.length - 1 ? maxTop : items[i + 1].top - size.boxHeight;
    items[i].top = Math.min(items[i].top, limit);
  }

  return items;
};

/** sticks to a neighbour in the way, and swaps with it once the pointer passes its midpoint */
export const dragTo = (
  items: readonly RankItem[],
  id: string,
  proposedTop: number,
  pointerY: number,
  size: TrackSize,
): RankItem[] => {
  const { boxHeight } = size;
  const { dragged, above, below } = neighboursOf(items, id);
  const top = clamp(proposedTop, 0, maxTopOf(size));

  if (above && top < above.top + boxHeight) {
    return pointerY < above.top + boxHeight / 2
      ? swapped(items, dragged, above)
      : moved(items, id, above.top + boxHeight);
  }

  if (below && top + boxHeight > below.top) {
    return pointerY > below.top + boxHeight / 2
      ? swapped(items, dragged, below)
      : moved(items, id, below.top - boxHeight);
  }

  return moved(items, id, top);
};

/** sticks to a neighbour in the way, and swaps with it when already flush */
export const nudge = (
  items: readonly RankItem[],
  id: string,
  delta: number,
  size: TrackSize,
): RankItem[] => {
  const { boxHeight } = size;
  const { dragged, above, below } = neighboursOf(items, id);
  const top = clamp(dragged.top + delta, 0, maxTopOf(size));
  const movingUp = delta < 0;
  const neighbour = movingUp ? above : below;

  if (!neighbour) return moved(items, id, top);

  const flushTop = movingUp
    ? neighbour.top + boxHeight
    : neighbour.top - boxHeight;
  const blocked = movingUp ? top < flushTop : top > flushTop;

  if (!blocked) return moved(items, id, top);
  if (dragged.top === flushTop) return swapped(items, dragged, neighbour);
  return moved(items, id, flushTop);
};

const byTop = (items: readonly RankItem[]) =>
  [...items].sort((a, b) => a.top - b.top);

const neighboursOf = (items: readonly RankItem[], id: string) => {
  const order = byTop(items);
  const index = order.findIndex((item) => item.id === id);
  return {
    dragged: order[index],
    above: order[index - 1] as RankItem | undefined,
    below: order[index + 1] as RankItem | undefined,
  };
};

const moved = (items: readonly RankItem[], id: string, top: number) =>
  items.map((item) => (item.id === id ? { ...item, top } : item));

const swapped = (items: readonly RankItem[], a: RankItem, b: RankItem) =>
  items.map((item) => {
    if (item.id === a.id) return { ...item, top: b.top };
    if (item.id === b.id) return { ...item, top: a.top };
    return item;
  });
