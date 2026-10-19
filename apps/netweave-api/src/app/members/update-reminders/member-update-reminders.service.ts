import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { MemberUpdateReminder } from './member-update-reminder.entity';
import { readUpdateReminderInterval } from './update-reminder-interval';
import {
  buildUpdateReminderMail,
  UpdateReminderRecipient,
} from './update-reminder-mail';

export interface DueMember extends UpdateReminderRecipient {
  id: number;
  invitationId: number;
  token: string;
}

/**
 * members whose last update and last reminder are both at least one interval ago. last update is the latest change of
 * the member row or of one of its answers, as saving only those leaves the member's own updated_at untouched.
 * members without email or invitation are left out: there is no address, or no link to their form
 */
const DUE_MEMBERS_QUERY = `
  SELECT m."id", m."name", m."contact", m."email", i."id" AS "invitationId", i."token", u."lastUpdatedAt"
  FROM "members" m
  JOIN "invitations" i ON i."id" = m."invitation_id"
  CROSS JOIN LATERAL (
    SELECT GREATEST(
      m."updated_at",
      (SELECT MAX(rr."updated_at") FROM "member_resources_requirements" rr WHERE rr."member_id" = m."id"),
      (SELECT MAX(cw."updated_at") FROM "member_culture_weights" cw WHERE cw."member_id" = m."id")
    ) AS "lastUpdatedAt"
  ) u
  WHERE m."email" IS NOT NULL
    AND GREATEST(
      u."lastUpdatedAt",
      (SELECT MAX(r."created_at") FROM "member_update_reminders" r WHERE r."member_id" = m."id")
    ) <= now() - $1::interval
  ORDER BY m."id"
`;

/**
 * the link reuses the invitation token, which expires 3 months after the invitation; keep it valid at least until
 * the next reminder, and for no less than an invitation, so a short interval does not leave a link that dies right away
 */
const EXTEND_LINK_QUERY = `
  UPDATE "invitations"
  SET "expire_date" = GREATEST("expire_date", now() + $2::interval, now() + interval '3 months')
  WHERE "id" = $1
`;

@Injectable()
export class MemberUpdateRemindersService {
  private readonly logger = new Logger(MemberUpdateRemindersService.name);
  private readonly interval = readUpdateReminderInterval();
  private running = false;

  public constructor(
    @InjectRepository(MemberUpdateReminder)
    private readonly repository: Repository<MemberUpdateReminder>,
    private readonly mailService: MailService,
  ) {
    this.logger.log(
      `MemberUpdateRemindersService initialized, reminding every ${this.interval}`,
    );
  }

  /** every minute, as the interval runs per member; never throws */
  @Cron(CronExpression.EVERY_MINUTE)
  public async sendDue(): Promise<void> {
    // a run outlasting the minute, e.g. on a slow smtp server, must not let the next one mail the same members
    if (this.running) return;
    this.running = true;

    try {
      const members: DueMember[] = await this.repository.query(
        DUE_MEMBERS_QUERY,
        [this.interval],
      );
      if (members.length === 0) return;

      let sent = 0;
      // sequentially, so a big network does not flood the smtp server
      for (const member of members) {
        if (await this.remind(member)) sent++;
      }

      this.logger.log(
        `Member update reminders: ${sent} sent, ${members.length - sent} failed`,
      );
    } catch (error) {
      this.logger.error('Failed to send the member update reminders', error);
    } finally {
      this.running = false;
    }
  }

  /** a failed mail is not recorded, so it is tried again on the next run */
  private async remind(member: DueMember): Promise<boolean> {
    // before sending, so the mailed link works from the start
    await this.repository.query(EXTEND_LINK_QUERY, [
      member.invitationId,
      this.interval,
    ]);

    const link = `${process.env.WEB_APP_URL}/member-questions/${member.token}`;
    const sent = await this.mailService.sendMail(
      buildUpdateReminderMail(member, link),
    );
    if (!sent) return false;

    await this.repository.insert({ memberId: member.id, email: member.email });
    return true;
  }
}
