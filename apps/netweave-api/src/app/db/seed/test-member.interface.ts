import type { ResourceRequirementCategory } from '@netweave/api-types';
import type { MemberCultureWeight } from '../../members/member-culture-weight.entity';

/** One seed file per member, see seed-data.ts. IDs, timestamps, token and status are set by the seed script. */
export interface TestMember {
  Invitation: {
    /**
     * mail of the organization
     * @example "mail@test.test"
     */
    email: string;
  };

  Member: {
    /**
     * name of the organization
     * @example "Member XY"
     */
    name: string;

    /**
     * name of a contact person
     * @example "Rudi Assauer"
     */
    contact: string;
  };

  /**
   * array length must be 7: exactly one entry for every `category`
   * @example [{category: 'competencies', resources; 'I know about...', requirements: 'I need...'}, {category: 'equipment', resources; 'I have...', requirements: 'I need...'}, ...]
   */
  Member_resources_requirements: {
    /**
     * "competencies" | "financial_resources" | "premises" | "land" | "equipment" | "networks" | "helping_hands"
     * @example "competencies"
     */
    category: ResourceRequirementCategory;

    /**
     * a description of any and all resources the member has in that category
     * @example "I have ..."
     */
    resources: string;

    /**
     * a description of any and all requirements the member has in that category
     * @example "I need ..."
     */
    requirements: string;
  }[];

  /**
   * array length must be 16: one entry for every itemId, from Z1-G, Z1-I, Z1-W, Z1-S ... to Z4-S
   * for every topic Z the weights of G+I+W+S must add up to 100
   * give each member weights which fit their premise, sometimes higher in G=community value, sometimes higher in S=structure
   * @example [{itemId: 'Z1-G', 20}, {itemId: 'Z1-W', 35}, ...]
   */
  Member_culture_weights: Pick<MemberCultureWeight, 'itemId' | 'weight'>[];
}
