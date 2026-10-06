import { parseCoverageScore } from './coverage-prompt';

describe('parseCoverageScore', () => {
  it.each([
    ['85', 85],
    ['0', 0],
    ['100', 100],
    [' 42\n', 42],
    ['85%', 85],
    ['Score: 7', 7],
  ])('reads %j as %d', (answer, score) => {
    expect(parseCoverageScore(answer)).toBe(score);
  });

  it.each(['', 'keine Ahnung', '101', '-5', '85.5', 'zwischen 40 und 60'])(
    'rejects %j',
    (answer) => {
      expect(parseCoverageScore(answer)).toBeNull();
    },
  );
});
