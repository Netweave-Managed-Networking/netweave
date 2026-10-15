import { randomBytes } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CultureItemId,
  CultureTopic,
  MemberUpsertDTO,
  parseCultureItemId,
} from '@netweave/api-types';
import {
  EntityManager,
  IsNull,
  MoreThan,
  Not,
  QueryFailedError,
  Raw,
  Repository,
} from 'typeorm';
import { Invitation } from '../invitations/invitation.entity';
import { MailService } from '../mail/mail.service';
import { hashToken } from '../utils/hash-token';
import { MemberCultureWeight } from './member-culture-weight.entity';
import { MemberResourceRequirement } from './member-resource-requirement.entity';
import { Member } from './member.entity';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  public static readonly EMAIL_CHANGE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  public constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
    private readonly mailService: MailService,
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

  public async getAllForMatching(): Promise<Member[]> {
    return this.membersRepository.find({
      relations: { resourcesRequirements: true, cultureWeights: true },
    });
  }

  /** whether any resource, requirement or culture answer changed after `since`, to skip runs that would not change anything */
  public async haveAnswersChangedSince(since: Date): Promise<boolean> {
    const manager = this.membersRepository.manager;
    const where = { updatedAt: MoreThan(since) };

    const [resourcesRequirementsChanged, cultureWeightsChanged] =
      await Promise.all([
        manager.exists(MemberResourceRequirement, { where }),
        manager.exists(MemberCultureWeight, { where }),
      ]);

    return resourcesRequirementsChanged || cultureWeightsChanged;
  }

  /**
   * members created after `since`, and older ones that changed their data after it; a member is never in both.
   * besides the member row itself this looks at its resources, requirements and culture weights, as saving only
   * those leaves the member's own updated_at untouched. without `since` all members count as new
   */
  public async getChangedSince(
    since: Date | null,
  ): Promise<{ created: Member[]; updated: Member[] }> {
    const select = { id: true, name: true } as const;
    const order = { name: 'ASC' } as const;
    if (!since) {
      return {
        created: await this.membersRepository.find({ select, order }),
        updated: [],
      };
    }

    const created = await this.membersRepository.find({
      select,
      where: { createdAt: MoreThan(since) },
      order,
    });

    const updated = await this.membersRepository
      .createQueryBuilder('member')
      .select(['member.id', 'member.name'])
      .where('member.created_at <= :since')
      .andWhere(
        `(member.updated_at > :since
          OR EXISTS (SELECT 1 FROM member_resources_requirements rr WHERE rr.member_id = member.id AND rr.updated_at > :since)
          OR EXISTS (SELECT 1 FROM member_culture_weights cw WHERE cw.member_id = member.id AND cw.updated_at > :since))`,
      )
      .setParameter('since', since)
      .orderBy('member.name', 'ASC')
      .getMany();

    return { created, updated };
  }

  /**
   * creates or updates the member of an invitation, including its resources, requirements and culture weights, and marks
   * the invitation as answered. A new email is not taken over but mailed a confirmation link, see confirmEmailChangeOrFail
   *
   * @throws ConflictException when the email is already used by another member
   * @throws ServiceUnavailableException when the confirmation mail could not be sent, nothing is saved then
   */
  public async saveForInvitation(
    invitation: Pick<Invitation, 'id' | 'email'>,
    dto: MemberUpsertDTO,
  ): Promise<Member> {
    try {
      // all or nothing: never leave a half-saved member behind
      return await this.membersRepository.manager.transaction(
        async (manager) => {
          const existing = await manager.findOne(Member, {
            where: { invitation: { id: invitation.id } },
          });

          const member = await manager.save(Member, {
            ...existing,
            name: dto.name,
            contact: dto.contact || null,
            // the invitation's email until the member confirms another one
            email: existing?.email ?? invitation.email,
            invitation: { id: invitation.id },
          });

          await this.upsertResourcesRequirements(manager, member.id, dto);
          await this.upsertCultureWeights(manager, member.id, dto);

          // only the first save counts as answer date, later edits keep it
          await manager.update(
            Invitation,
            { id: invitation.id, answeredDate: IsNull() },
            { answeredDate: new Date() },
          );

          // last write, so a mailed link is not lost to a rollback caused by a later step
          await this.requestEmailChange(manager, member, dto.email.trim());

          // re-read, so the caller gets what is actually stored
          return manager.findOneOrFail(Member, {
            where: { id: member.id },
            relations: { resourcesRequirements: true, cultureWeights: true },
          });
        },
      );
    } catch (error) {
      throw isEmailTaken(error) ? emailTakenException() : error;
    }
  }

  /**
   * replaces the email of the token's member with the one that was confirmed
   *
   * @throws BadRequestException when the token is unknown or expired
   * @throws ConflictException when another member took the email in the meantime
   */
  public async confirmEmailChangeOrFail(token: string): Promise<void> {
    const member = await this.membersRepository.findOne({
      where: {
        emailChangeTokenHash: hashToken(token),
        emailChangeExpiresAt: MoreThan(new Date()),
      },
      select: { id: true, pendingEmail: true },
    });
    if (!member?.pendingEmail)
      throw new BadRequestException('Invalid or expired confirmation token');

    try {
      await this.membersRepository.update(member.id, {
        email: member.pendingEmail,
        ...NO_EMAIL_CHANGE,
      });
    } catch (error) {
      throw isEmailTaken(error) ? emailTakenException() : error;
    }
  }

  /**
   * mails a confirmation link to a new email and keeps it as pending until confirmed. Requesting the current email
   * again cancels a pending change; requesting the pending one again only sends a new link once the old one expired
   */
  private async requestEmailChange(
    manager: EntityManager,
    member: Pick<Member, 'id' | 'email' | 'pendingEmail'>,
    email: string,
  ): Promise<void> {
    if (isSameEmail(email, member.email)) {
      if (member.pendingEmail)
        await manager.update(Member, member.id, NO_EMAIL_CHANGE);
      return;
    }

    if (isSameEmail(email, member.pendingEmail)) {
      const { emailChangeExpiresAt } = await manager.findOneOrFail(Member, {
        where: { id: member.id },
        select: { id: true, emailChangeExpiresAt: true },
      });
      if (emailChangeExpiresAt && emailChangeExpiresAt > new Date()) return;
    }

    if (await this.isEmailTakenByOther(manager, member.id, email))
      throw emailTakenException();

    const token = randomBytes(32).toString('base64url');
    await manager.update(Member, member.id, {
      pendingEmail: email,
      emailChangeTokenHash: hashToken(token),
      emailChangeExpiresAt: new Date(
        Date.now() + MembersService.EMAIL_CHANGE_TTL_MS,
      ),
    });

    const link = `${process.env.WEB_APP_URL}/member-email-confirm/${token}`;
    const sent = await this.mailService.sendMail({
      to: email,
      subject: 'Bestätige deine neue E-Mail-Adresse für Netweave',
      html: emailChangeMailHtml(link),
    });
    if (!sent)
      throw new ServiceUnavailableException(
        'Confirmation mail could not be sent',
      );
  }

  /** used by another member, or by an open invitation whose first save would make it a member's email */
  private async isEmailTakenByOther(
    manager: EntityManager,
    memberId: number,
    email: string,
  ): Promise<boolean> {
    const sameEmail = Raw((column) => `lower(${column}) = lower(:email)`, {
      email,
    });

    const takenByMember = await manager.exists(Member, {
      where: { id: Not(memberId), email: sameEmail },
    });
    if (takenByMember) return true;

    return manager.exists(Invitation, {
      where: {
        email: sameEmail,
        expireDate: MoreThan(new Date()),
        member: { id: IsNull() },
      },
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
      skipUpdateIfNoValuesChanged: true, // keeps updated_at of unchanged categories, see haveAnswersChangedSince
    });
  }

  private async upsertCultureWeights(
    manager: EntityManager,
    memberId: number,
    { cultureWeights }: MemberUpsertDTO,
  ): Promise<void> {
    if (cultureWeights.length === 0) return; // typeorm rejects an empty upsert

    const topicOf = (itemId: CultureItemId) => parseCultureItemId(itemId).topic;
    const totalOf = (topic: CultureTopic) =>
      cultureWeights
        .filter(({ itemId }) => topicOf(itemId) === topic)
        .reduce((sum, { weight }) => sum + weight, 0);

    const rows = cultureWeights.map(({ itemId, weight }) => ({
      memberId,
      itemId,
      weight,
      topicTotal: totalOf(topicOf(itemId)),
    }));

    await manager.upsert(MemberCultureWeight, rows, {
      conflictPaths: ['memberId', 'itemId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}

const NO_EMAIL_CHANGE = {
  pendingEmail: null,
  emailChangeTokenHash: null,
  emailChangeExpiresAt: null,
};

const isSameEmail = (a: string, b: string | null | undefined): boolean =>
  !!b && a.toLowerCase() === b.toLowerCase();

/** the unique index on lower(email) rejected the write, e.g. when two members confirm the same email concurrently */
const isEmailTaken = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  (error.driverError as { constraint?: string })?.constraint ===
    'UQ_members_email';

const emailTakenException = () =>
  new ConflictException('Email is already used by another member');

function emailChangeMailHtml(link: string): string {
  return `<p>Hallo,</p>
<p>für eure Organisation wurde diese E-Mail-Adresse als neue Kontaktadresse bei Netweave angegeben. Bitte bestätige sie über folgenden Link:</p>
<p><a href="${link}">${link}</a></p>
<p>Der Link ist 7 Tage gültig. Bis zur Bestätigung bleibt die bisherige E-Mail-Adresse bestehen.</p>
<p>Falls du diese Änderung nicht erwartet hast, kannst du diese Mail ignorieren.</p>`;
}
