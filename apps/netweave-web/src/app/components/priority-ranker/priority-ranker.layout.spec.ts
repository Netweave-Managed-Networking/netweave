import {
  dragTo,
  nudge,
  priorityOf,
  RankItem,
  shuffle,
  stackedLayout,
  TrackSize,
  weightedLayout,
  weightsOf,
} from './priority-ranker.layout';

// travel = 500, so 1 priority point = 5px
const size: TrackSize = { trackHeight: 600, boxHeight: 100 };

const statements = ['a', 'b', 'c', 'd'].map((id) => ({ id, text: id }));

const items = (tops: Record<string, number>): RankItem[] =>
  statements.map((statement) => ({ ...statement, top: tops[statement.id] }));

// rounded, to ignore floating point noise
const topsOf = (result: RankItem[]) =>
  Object.fromEntries(result.map((item) => [item.id, Math.round(item.top)]));

describe('priority ranker layout', () => {
  it('maps the top of the track to 100 and the bottom to 0', () => {
    expect(priorityOf(0, size)).toBe(100);
    expect(priorityOf(250, size)).toBe(50);
    expect(priorityOf(500, size)).toBe(0);
  });

  it('stacks unranked statements in the middle of the track, in the given order', () => {
    expect(topsOf(stackedLayout(statements, size))).toEqual({
      a: 100,
      b: 200,
      c: 300,
      d: 400,
    });
  });

  it('shuffles without losing or duplicating statements', () => {
    expect(
      shuffle(statements)
        .map(({ id }) => id)
        .sort(),
    ).toEqual(['a', 'b', 'c', 'd']);
  });

  it('places statements by their weights, which read back as the same weights', () => {
    const weights = { a: 100, b: 40, c: 70, d: 0 };

    const result = weightedLayout(statements, weights, size);

    expect(topsOf(result)).toEqual({ a: 0, c: 150, b: 300, d: 500 });
    expect(weightsOf(result, size)).toEqual(weights);
  });

  it('pushes apart boxes whose weights would make them overlap', () => {
    const result = weightedLayout(
      statements,
      { a: 100, b: 99, c: 1, d: 0 },
      size,
    );

    expect(topsOf(result)).toEqual({ a: 0, b: 100, c: 400, d: 500 });
  });

  describe('dragTo', () => {
    const start = items({ a: 0, b: 150, c: 300, d: 400 });

    it('follows the pointer when nothing is in the way', () => {
      expect(topsOf(dragTo(start, 'b', 180, 230, size))).toMatchObject({
        b: 180,
      });
    });

    it('keeps the box on the track', () => {
      expect(topsOf(dragTo(start, 'a', -50, 0, size))).toMatchObject({ a: 0 });
    });

    it('sticks flush to the neighbour in the way', () => {
      // pointer has not passed the midpoint of c (350)
      expect(topsOf(dragTo(start, 'b', 260, 340, size))).toMatchObject({
        b: 200,
        c: 300,
      });
    });

    it('swaps with the neighbour once the pointer passes its midpoint', () => {
      expect(topsOf(dragTo(start, 'b', 280, 360, size))).toMatchObject({
        b: 300,
        c: 150,
      });
    });

    it('swaps upwards as well', () => {
      expect(topsOf(dragTo(start, 'b', 20, 40, size))).toMatchObject({
        a: 150,
        b: 0,
      });
    });
  });

  describe('nudge', () => {
    const start = items({ a: 0, b: 150, c: 300, d: 400 });

    it('moves by the given delta', () => {
      expect(topsOf(nudge(start, 'b', 5, size))).toMatchObject({ b: 155 });
    });

    it('sticks to the neighbour first', () => {
      expect(topsOf(nudge(start, 'b', 80, size))).toMatchObject({
        b: 200,
        c: 300,
      });
    });

    it('swaps with the neighbour when already flush', () => {
      expect(topsOf(nudge(start, 'c', 5, size))).toMatchObject({
        c: 400,
        d: 300,
      });
    });

    it('stays at the end of the track', () => {
      expect(topsOf(nudge(start, 'a', -5, size))).toMatchObject({ a: 0 });
      expect(topsOf(nudge(start, 'd', 500, size))).toMatchObject({ d: 500 });
    });
  });
});
