import { Controller, Get } from '@nestjs/common';
import { OrganizationDTO } from '@netweave/api-types';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationController {
  public constructor(
    private readonly organizationService: OrganizationsService,
  ) {}

  @Get('/latest')
  public getLatest(): Promise<OrganizationDTO | null> {
    return this.organizationService.getLatestOrganization();
  }
}
