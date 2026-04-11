import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {
    this.logger.log(`OrganizationService initialized`);
  }

  @Cron('*/1 * * * *')
  public async addNewOrganization() {
    try {
      const organization = await this.organizationsRepository.save({
        name: `Organization ${new Date().toISOString()}`,
        contact: `contact@${new Date().getTime()}.com`,
      });
      this.logger.log(`New organization added: ${organization.name}`);
    } catch (error) {
      this.logger.error(
        `Error occurred while adding new organization: ${error.message}`,
      );
    }
  }
}
