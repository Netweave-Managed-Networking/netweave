import { CoopCriteria } from './coop-criteria.model';
import { PickStringAsNumber } from './max-string-lengths.type';

export type CoopCriteriaCreate = Partial<Pick<CoopCriteria, 'for_coop' | 'ko_no_coop'>>;

export const emptyCoopCriteria: CoopCriteriaCreate = {
  for_coop: '',
  ko_no_coop: '',
};

/** these numbers are derived from the database limits */
export const coopMax: PickStringAsNumber<CoopCriteriaCreate> = {
  for_coop: 4095,
  ko_no_coop: 4095,
};

export type CoopCriteriaCreateErrors = Partial<Record<keyof CoopCriteriaCreate, string>>;
