import { Controller, Get } from '@nestjs/common';
import { OrganizationDTO } from '@netweave/api-types';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationsService) {}

  @Get('/latest')
  getLatest(): Promise<OrganizationDTO | null> {
    return this.organizationService.getLatestOrganization();
  }
}
