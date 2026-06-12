import { EntityDTO } from '../entity/entity.dto.interface';

export interface OrganizationDTO extends EntityDTO {
  name: string;
  contact: string | null;
}
