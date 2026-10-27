import 'reflect-metadata';
import { MemberUpsertDTO } from '@netweave/api-types';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const topicWeights = (topic: string, weights: number[]) =>
  ['G', 'I', 'W', 'S'].map((orientation, i) => ({
    itemId: `${topic}-${orientation}`,
    weight: weights[i],
  }));

const validateDTO = async (overrides: Record<string, unknown>) => {
  const dto = plainToInstance(MemberUpsertDTO, {
    name: 'Acme e.V.',
    contact: null,
    email: 'nt@example.com',
    resourcesRequirements: [],
    cultureWeights: [],
    viewOfEnvironmentAnswers: [],
    ...overrides,
  });
  const errors = await validate(dto);
  return errors.map((error) => error.property);
};

const validateCultureWeights = (cultureWeights: unknown) =>
  validateDTO({ cultureWeights });

describe('MemberUpsertDTO email validation', () => {
  it('accepts a valid email', async () => {
    expect(await validateDTO({ email: 'neu@example.com' })).toEqual([]);
  });

  it.each([[''], ['keine-email'], ['nt@'], [undefined]])(
    'rejects %p',
    async (email) => {
      expect(await validateDTO({ email })).toEqual(['email']);
    },
  );
});

describe('MemberUpsertDTO culture weights validation', () => {
  it('accepts no culture weights at all', async () => {
    expect(await validateCultureWeights([])).toEqual([]);
  });

  it('accepts complete topics, leaving others unanswered', async () => {
    expect(
      await validateCultureWeights([
        ...topicWeights('Z1', [100, 90, 80, 70]),
        ...topicWeights('Z4', [0, 14, 60, 100]),
      ]),
    ).toEqual([]);
  });

  it('rejects an incomplete topic', async () => {
    expect(
      await validateCultureWeights(
        topicWeights('Z2', [50, 40, 30, 20]).slice(1),
      ),
    ).toEqual(['cultureWeights']);
  });

  it('rejects a topic whose weights are all 0, as it cannot be normalized', async () => {
    expect(
      await validateCultureWeights(topicWeights('Z2', [0, 0, 0, 0])),
    ).toEqual(['cultureWeights']);
  });

  it('rejects duplicate items', async () => {
    expect(
      await validateCultureWeights([
        ...topicWeights('Z1', [100, 90, 80, 70]),
        { itemId: 'Z1-G', weight: 10 },
      ]),
    ).toEqual(['cultureWeights']);
  });

  it.each([
    ['an unknown item id', { itemId: 'Z5-G', weight: 10 }],
    ['a negative weight', { itemId: 'Z1-G', weight: -1 }],
    ['a weight above 100', { itemId: 'Z1-G', weight: 101 }],
    ['a fractional weight', { itemId: 'Z1-G', weight: 1.5 }],
  ])('rejects %s', async (_, item) => {
    expect(
      await validateCultureWeights([
        item,
        ...topicWeights('Z1', [100, 90, 80, 70]).slice(1),
      ]),
    ).toContain('cultureWeights');
  });
});

describe('MemberUpsertDTO view of environment answers validation', () => {
  const validateAnswers = (viewOfEnvironmentAnswers: unknown) =>
    validateDTO({ viewOfEnvironmentAnswers });

  it('accepts no answers at all', async () => {
    expect(await validateAnswers([])).toEqual([]);
  });

  it('accepts some questions answered with every Likert step', async () => {
    expect(
      await validateAnswers([
        { itemId: 'UA1', answer: 0 },
        { itemId: 'UA2', answer: 1 },
        { itemId: 'UA5', answer: 2 },
        { itemId: 'UA8', answer: 3 },
        { itemId: 'UA10', answer: 4 },
      ]),
    ).toEqual([]);
  });

  it('rejects a question answered twice', async () => {
    expect(
      await validateAnswers([
        { itemId: 'UA1', answer: 0 },
        { itemId: 'UA1', answer: 4 },
      ]),
    ).toEqual(['viewOfEnvironmentAnswers']);
  });

  it.each([
    ['an unknown item id', { itemId: 'UA11', answer: 2 }],
    ['a culture item id', { itemId: 'Z1-G', answer: 2 }],
    ['a negative answer', { itemId: 'UA1', answer: -1 }],
    ['an answer above 4', { itemId: 'UA1', answer: 5 }],
    ['a fractional answer', { itemId: 'UA1', answer: 1.5 }],
    ['an answer as string', { itemId: 'UA1', answer: '2' }],
    ['a missing answer', { itemId: 'UA1' }],
  ])('rejects %s', async (_, item) => {
    expect(await validateAnswers([item])).toEqual(['viewOfEnvironmentAnswers']);
  });

  it('rejects missing answers', async () => {
    expect(await validateAnswers(undefined)).toEqual([
      'viewOfEnvironmentAnswers',
    ]);
  });
});
