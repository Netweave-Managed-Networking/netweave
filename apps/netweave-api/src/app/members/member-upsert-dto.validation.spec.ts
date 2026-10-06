import 'reflect-metadata';
import { MemberUpsertDTO } from '@netweave/api-types';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const topicWeights = (topic: string, weights: number[]) =>
  ['G', 'I', 'W', 'S'].map((orientation, i) => ({
    itemId: `${topic}-${orientation}`,
    weight: weights[i],
  }));

const validateCultureWeights = async (cultureWeights: unknown) => {
  const dto = plainToInstance(MemberUpsertDTO, {
    name: 'Acme e.V.',
    contact: null,
    resourcesRequirements: [],
    cultureWeights,
  });
  const errors = await validate(dto);
  return errors.map((error) => error.property);
};

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
