import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  CultureTopic,
  MemberUpsertDTO,
  toCultureTopic,
} from '@netweave/api-types';
import { EntityManager, IsNull, MoreThan, Repository } from 'typeorm';
import { Invitation } from '../invitations/invitation.entity';
import { MemberCultureWeight } from './member-culture-weight.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
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

  public async getAllWithResourcesRequirements(): Promise<Member[]> {
    return this.membersRepository.find({
      relations: { resourcesRequirements: true },
    });
  }

  /** whether any resource or requirement changed after `since`, e.g. to skip matching runs that would not change anything */
  public async haveResourcesRequirementsChangedSince(
    since: Date,
  ): Promise<boolean> {
    return this.membersRepository.manager.exists(MemberResourceRequirement, {
      where: { updatedAt: MoreThan(since) },
    });
  }

  /** creates or updates the member of an invitation, including its resources, requirements and culture weights, and marks the invitation as answered */
  public async saveForInvitation(
    invitationId: number,
    dto: MemberUpsertDTO,
  ): Promise<Member> {
    // all or nothing: never leave a half-saved member behind
    return this.membersRepository.manager.transaction(async (manager) => {
      const existing = await manager.findOne(Member, {
        where: { invitation: { id: invitationId } },
      });

      const member = await manager.save(Member, {
        ...existing,
        name: dto.name,
        contact: dto.contact || null,
        invitation: { id: invitationId },
      });

      await this.upsertResourcesRequirements(manager, member.id, dto);
      await this.upsertCultureWeights(manager, member.id, dto);

      // only the first save counts as answer date, later edits keep it
      await manager.update(
        Invitation,
        { id: invitationId, answeredDate: IsNull() },
        { answeredDate: new Date() },
      );

      // re-read, so the caller gets what is actually stored
      return manager.findOneOrFail(Member, {
        where: { id: member.id },
        relations: { resourcesRequirements: true, cultureWeights: true },
      });
    });
  }

  /** one row per member and category: updates existing categories, inserts new ones */
  private async upsertResourcesRequirements(
    manager: EntityManager,
    memberId: number,
    { resourcesRequirements }: MemberUpsertDTO,
  ): Promise<void> {
    if (resourcesRequirements.length === 0) return; // typeorm rejects an empty upsert

    const rows = resourcesRequirements.map(
      ({ category, resources, requirements }) => ({
        memberId,
        category,
        resources: resources || null,
        requirements: requirements || null,
      }),
    );

    await manager.upsert(MemberResourceRequirement, rows, {
      conflictPaths: ['memberId', 'category'],
      skipUpdateIfNoValuesChanged: true, // keeps updated_at of unchanged categories, see haveResourcesRequirementsChangedSince
    });
  }

  /** one row per member and statement; the topic total is stored with each weight, so it can be normalized exactly */
  private async upsertCultureWeights(
    manager: EntityManager,
    memberId: number,
    { cultureWeights }: MemberUpsertDTO,
  ): Promise<void> {
    if (cultureWeights.length === 0) return; // typeorm rejects an empty upsert

    const topicTotals = new Map<CultureTopic, number>();
    for (const { itemId, weight } of cultureWeights) {
      const topic = toCultureTopic(itemId);
      topicTotals.set(topic, (topicTotals.get(topic) ?? 0) + weight);
    }

    const rows = cultureWeights.map(({ itemId, weight }) => ({
      memberId,
      itemId,
      weight,
      topicTotal: topicTotals.get(toCultureTopic(itemId)) ?? 0,
    }));

    await manager.upsert(MemberCultureWeight, rows, {
      conflictPaths: ['memberId', 'itemId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
