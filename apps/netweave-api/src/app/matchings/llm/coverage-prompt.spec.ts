import { parseCoverageScore } from './coverage-prompt';

describe('parseCoverageScore', () => {
  it.each([
    ['{"score":85}', 85],
    ['{"score":0}', 0],
    ['{"score":100}', 100],
    [' \n{"score":42}\n', 42],
  ])('reads %j as %d', (answer, score) => {
    expect(parseCoverageScore(answer)).toBe(score);
  });

  it.each([
    '',
    'keine Ahnung',
    '85',
    '{"score":"85"}',
    '{"score":101}',
    '{"score":-5}',
    '{"score":85.5}',
    '{"other":85}',
    'zwischen 40 und 60',
  ])('rejects %j', (answer) => {
    expect(parseCoverageScore(answer)).toBeNull();
  });
});
