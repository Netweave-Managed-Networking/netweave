import { EntityDTO } from '../entity/entity.dto.interface';

export interface MemberDTO extends EntityDTO {
  name: string;
  contact: string | null;
}
