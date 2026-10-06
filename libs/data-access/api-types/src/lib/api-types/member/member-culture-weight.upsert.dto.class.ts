import { IsIn, IsInt, Max, Min } from 'class-validator';
import { CULTURE_ITEM_IDS, CultureItemId } from './culture.type';

export class MemberCultureWeightUpsertDTO {
  @IsIn(CULTURE_ITEM_IDS)
  declare public itemId: CultureItemId;

  /** raw priority as entered (0 = lowest, 100 = highest), only meaningful relative to the other weights of its topic */
  @IsInt()
  @Min(0)
  @Max(100)
  declare public weight: number;
}
