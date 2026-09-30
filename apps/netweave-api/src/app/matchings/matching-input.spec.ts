import { MemberResourceRequirement } from '../members/member-resource-requirement.entity';
import { Member } from '../members/member.entity';
import { hasAnswers } from './matching-input';

const member = (
  resourcesRequirements?: Pick<
    MemberResourceRequirement,
    'resources' | 'requirements'
  >[],
): Member => ({ id: 1, resourcesRequirements }) as Member;

describe('hasAnswers', () => {
  it('is true when a resource or a requirement is filled', () => {
    expect(
      hasAnswers(member([{ resources: 'a tractor', requirements: null }])),
    ).toBe(true);
    expect(
      hasAnswers(member([{ resources: null, requirements: 'a need' }])),
    ).toBe(true);
  });

  it('is true when only one of several categories is filled', () => {
    expect(
      hasAnswers(
        member([
          { resources: null, requirements: null },
          { resources: 'a tractor', requirements: null },
        ]),
      ),
    ).toBe(true);
  });

  it('ignores empty and whitespace only answers', () => {
    expect(
      hasAnswers(
        member([
          { resources: '', requirements: '   ' },
          { resources: '\n\t', requirements: null },
        ]),
      ),
    ).toBe(false);
  });

  it('is false without any categories or when they were not loaded', () => {
    expect(hasAnswers(member([]))).toBe(false);
    expect(hasAnswers(member(undefined))).toBe(false);
  });
});
