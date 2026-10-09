import { IsIn, IsInt, Max, Min } from 'class-validator';
import { CULTURE_ITEM_IDS, CultureItemId } from './culture.type';

export class MemberCultureWeightUpsertDTO {
  @IsIn(CULTURE_ITEM_IDS)
  declare public itemId: CultureItemId;

  @IsInt()
  @Min(0)
  @Max(100)
  declare public weight: number;
}
