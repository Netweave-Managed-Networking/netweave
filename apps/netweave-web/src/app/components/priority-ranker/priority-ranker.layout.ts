export interface RankerStatement {
  id: string;
  text: string;
}

/** priority per statement id, 0 (bottom of the track) to 100 (top of the track) */
export type PriorityWeights = Record<string, number>;

export interface RankItem extends RankerStatement {
  /** offset from the top of the track in px */
  top: number;
}

export interface TrackSize {
  trackHeight: number;
  boxHeight: number;
}

/** how far a box can move: its top ranges from 0 to travel */
const travelOf = ({ trackHeight, boxHeight }: TrackSize) =>
  trackHeight - boxHeight;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const byTop = (items: readonly RankItem[]) =>
  [...items].sort((a, b) => a.top - b.top);

export const shuffle = <T>(items: readonly T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const priorityOf = (top: number, size: TrackSize): number =>
  Math.round((1 - top / travelOf(size)) * 100);

export const weightsOf = (
  items: readonly RankItem[],
  size: TrackSize,
): PriorityWeights =>
  Object.fromEntries(
    items.map((item) => [item.id, priorityOf(item.top, size)]),
  );

/** unranked: boxes stacked in the middle of the track in the given order, so the first drag is what makes it meaningful */
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

/** places the boxes according to saved weights; as weights are rounded, flush boxes might slightly overlap, so they get pushed apart */
export const weightedLayout = (
  statements: readonly RankerStatement[],
  weights: PriorityWeights,
  size: TrackSize,
): RankItem[] => {
  const travel = travelOf(size);
  const items = byTop(
    statements.map((statement) => ({
      ...statement,
      top: clamp((1 - (weights[statement.id] ?? 0) / 100) * travel, 0, travel),
    })),
  );

  for (let i = 1; i < items.length; i++) {
    items[i].top = Math.max(items[i].top, items[i - 1].top + size.boxHeight);
  }
  for (let i = items.length - 1; i >= 0; i--) {
    const limit =
      i === items.length - 1 ? travel : items[i + 1].top - size.boxHeight;
    items[i].top = Math.min(items[i].top, limit);
  }

  return items;
};

/**
 * Moves a box towards `proposedTop`, but stops it flush against a neighbour in the way. Once the pointer passes the
 * neighbour's midpoint, the two swap: the neighbour takes the box's last spot and the box lands on its far side.
 */
export const dragTo = (
  items: readonly RankItem[],
  id: string,
  proposedTop: number,
  pointerY: number,
  size: TrackSize,
): RankItem[] => {
  const { boxHeight } = size;
  const order = byTop(items);
  const index = order.findIndex((item) => item.id === id);
  const dragged = order[index];
  const above = order[index - 1];
  const below = order[index + 1];
  const top = clamp(proposedTop, 0, travelOf(size));

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

/** keyboard variant of dragTo: moves by `delta` px, sticking to a neighbour first and swapping with it when already flush */
export const nudge = (
  items: readonly RankItem[],
  id: string,
  delta: number,
  size: TrackSize,
): RankItem[] => {
  const { boxHeight } = size;
  const order = byTop(items);
  const index = order.findIndex((item) => item.id === id);
  const dragged = order[index];
  const neighbour = delta < 0 ? order[index - 1] : order[index + 1];
  const top = clamp(dragged.top + delta, 0, travelOf(size));

  if (!neighbour) return moved(items, id, top);

  const flushTop =
    delta < 0 ? neighbour.top + boxHeight : neighbour.top - boxHeight;
  const blocked = delta < 0 ? top < flushTop : top > flushTop;

  if (!blocked) return moved(items, id, top);
  return dragged.top === flushTop
    ? swapped(items, dragged, neighbour)
    : moved(items, id, flushTop);
};

const moved = (items: readonly RankItem[], id: string, top: number) =>
  items.map((item) => (item.id === id ? { ...item, top } : item));

const swapped = (items: readonly RankItem[], a: RankItem, b: RankItem) =>
  items.map((item) => {
    if (item.id === a.id) return { ...item, top: b.top };
    if (item.id === b.id) return { ...item, top: a.top };
    return item;
  });
