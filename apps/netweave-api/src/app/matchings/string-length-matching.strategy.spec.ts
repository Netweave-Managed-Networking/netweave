import { ResourceRequirementCategory } from '@netweave/api-types';
import { MemberResourceRequirement } from '../members/member-resource-requirement.entity';
import { Member } from '../members/member.entity';
import { StringLengthMatchingStrategy } from './string-length-matching.strategy';

type Entry = {
  category: ResourceRequirementCategory;
  resources?: string | null;
  requirements?: string | null;
};

const member = (id: number, entries: Entry[]): Member =>
  ({
    id,
    resourcesRequirements: entries.map((e) => ({
      resources: null,
      requirements: null,
      ...e,
    })) as MemberResourceRequirement[],
  }) as Member;

const chars = (n: number) => 'x'.repeat(n);

describe('StringLengthMatchingStrategy', () => {
  const strategy = new StringLengthMatchingStrategy();

  it('gives 100 for a resource of the same length as the requirement', async () => {
    const a = member(1, [{ category: 'premises', requirements: chars(56) }]);
    const b = member(2, [{ category: 'premises', resources: chars(56) }]);

    expect((await strategy.score(a, b)).score).toBe(100);
  });

  it('ranks resources by how close their length is to the requirement (ticket example)', async () => {
    const a = member(1, [{ category: 'premises', requirements: chars(56) }]);
    const score = async (length: number) =>
      (
        await strategy.score(
          a,
          member(2, [{ category: 'premises', resources: chars(length) }]),
        )
      ).score;

    expect(await score(57)).toBe(98);
    expect(await score(50)).toBe(89);
    expect(await score(80)).toBe(57);
    expect(await score(200)).toBe(0); // never below 0
  });

  it('is unidirectional: A→B differs from B→A', async () => {
    const a = member(1, [
      { category: 'premises', requirements: chars(50), resources: chars(20) },
    ]);
    const b = member(2, [
      { category: 'premises', requirements: chars(10), resources: chars(40) },
    ]);

    expect((await strategy.score(a, b)).score).toBe(80); // a needs 50, b offers 40
    expect((await strategy.score(b, a)).score).toBe(0); // b needs 10, a offers 20
  });

  it('only compares within the same category', async () => {
    const a = member(1, [{ category: 'premises', requirements: chars(20) }]);
    const b = member(2, [{ category: 'land', resources: chars(20) }]);

    expect(await strategy.score(a, b)).toEqual({
      score: 0,
      details: { categories: [{ category: 'premises', score: 0 }] },
    });
  });

  it('averages over the categories the source has requirements in', async () => {
    const a = member(1, [
      { category: 'premises', requirements: chars(20) },
      { category: 'land', requirements: chars(10) },
      { category: 'equipment', resources: chars(10) }, // no requirement, ignored
    ]);
    const b = member(2, [
      { category: 'premises', resources: chars(20) },
      { category: 'land', resources: '   ' }, // whitespace only counts as empty
    ]);

    expect(await strategy.score(a, b)).toEqual({
      score: 50,
      details: {
        categories: [
          { category: 'premises', score: 100 },
          { category: 'land', score: 0 },
        ],
      },
    });
  });

  it('gives 0 for incomplete members without requirements or relations', async () => {
    const empty = { id: 1 } as Member;
    const b = member(2, [{ category: 'premises', resources: chars(20) }]);

    expect(await strategy.score(empty, b)).toEqual({
      score: 0,
      details: { categories: [] },
    });
    expect(
      (
        await strategy.score(
          member(3, [{ category: 'premises', requirements: chars(5) }]),
          empty,
        )
      ).score,
    ).toBe(0);
  });
});
