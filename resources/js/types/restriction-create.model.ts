import { PickStringAsNumber } from './max-string-lengths.type';
import { Restriction } from './restriction.model';

export type RestrictionCreate = Partial<Pick<Restriction, 'description'>> & {
  type: Restriction['type'];
};

export const emptyRestriction: (
  type: Restriction['type']
) => RestrictionCreate = type => ({ type, description: '' });

/** these numbers are derived from the database limits */
export const restrictionMax: PickStringAsNumber<RestrictionCreate> = {
  type: 15,
  description: 1023,
};

export type RestrictionCreateErrors = Partial<
  Record<keyof RestrictionCreate, string>
>;
