import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { MemberUpsertDTO } from '@netweave/api-types';
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

  /** creates or updates the member of an invitation */
  public async saveForInvitation(
    invitationId: number,
    dto: MemberUpsertDTO,
  ): Promise<Member> {
    const existing = await this.membersRepository.findOne({
      where: { invitation: { id: invitationId } },
    });

    return this.membersRepository.save({
      ...existing,
      name: dto.name,
      contact: dto.contact || null,
      invitation: { id: invitationId },
    });
  }
}
