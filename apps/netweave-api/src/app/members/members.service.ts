import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  public constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
  ) {
    this.logger.log(`MembersService initialized`);
  }

  @Cron('*/1 * * * *')
  public async addNewMember() {
    try {
      const member = await this.membersRepository.save({
        name: `Netzwerkteilnehmer ${new Date().toISOString()}`,
        contact: `contact@${new Date().getTime()}.com`,
      });
      this.logger.log(`New member added: ${member.name}`);
    } catch (error) {
      const e = error as Error;
      this.logger.error(`Error occurred while adding new member: ${e.message}`);
    }
  }

  public async getMemberCount(): Promise<number> {
    return this.membersRepository.count();
  }

  public async getLatestMember(): Promise<Member | null> {
    try {
      return await this.membersRepository
        .createQueryBuilder('members')
        .where('members.created_at = (SELECT MAX(e.created_at) FROM members e)')
        .take(1)
        .getOneOrFail();
    } catch {
      return null;
    }
  }
}
