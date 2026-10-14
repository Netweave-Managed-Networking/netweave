import { Injectable, Logger } from '@nestjs/common';
import { RecommendationsDTO } from '@netweave/api-types';
import { MailService } from '../../mail/mail.service';
import { MemberResourceRequirement } from '../../members/member-resource-requirement.entity';
import { Member } from '../../members/member.entity';
import { MembersService } from '../../members/members.service';
import {
  buildRecommendationMail,
  RecommendationContact,
} from './recommendation-mail';

@Injectable()
export class RecommendationMailsService {
  private readonly logger = new Logger(RecommendationMailsService.name);

  public constructor(
    private readonly membersService: MembersService,
    private readonly mailService: MailService,
  ) {
    this.logger.log(`RecommendationMailsService initialized`);
  }

  /** never throws, so a mail problem can never fail the run it is called for */
  public async sendForRun(
    runId: number,
    recommendations: RecommendationsDTO,
  ): Promise<void> {
    if (process.env.SEND_RECOMMENDATION_MAILS === 'false') {
      this.logger.log(
        `SEND_RECOMMENDATION_MAILS is false, not sending the recommendation mails of matching run ${runId}`,
      );
      return;
    }

    try {
      const members = await this.membersService.getAllWithResources();
      const contacts = toContacts(members);

      let sent = 0;
      let failed = 0;

      // sequentially, so a big network does not flood the smtp server
      for (const memberRecommendations of recommendations.members) {
        const recipient = contacts.get(memberRecommendations.seekerId);

        if (!recipient) {
          continue;
        }

        const mail = buildRecommendationMail(
          memberRecommendations,
          recipient,
          contacts,
        );

        if (!mail) {
          continue;
        }

        if (await this.mailService.sendMail(mail)) {
          sent++;
        } else {
          failed++;
        }
      }

      const skipped = recommendations.members.length - sent - failed;

      this.logger.log(
        `Recommendation mails of matching run ${runId}: ${sent} sent, ${failed} failed, ${skipped} skipped`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send the recommendation mails of matching run ${runId}`,
        error,
      );
    }
  }
}

/** by member id; only members with an email address, the confirmed one if it was changed */
const toContacts = (members: Member[]): Map<number, RecommendationContact> => {
  const contacts = new Map<number, RecommendationContact>();

  for (const { id, name, contact, email, resourcesRequirements } of members) {
    if (email) {
      contacts.set(id, {
        name,
        contact,
        email,
        resources: toResources(resourcesRequirements ?? []),
      });
    }
  }

  return contacts;
};

const toResources = (
  resourcesRequirements: MemberResourceRequirement[],
): RecommendationContact['resources'] => {
  const resources: RecommendationContact['resources'] = {};

  for (const { category, resources: text } of resourcesRequirements) {
    if (text?.trim()) {
      resources[category] = text.trim();
    }
  }

  return resources;
};
