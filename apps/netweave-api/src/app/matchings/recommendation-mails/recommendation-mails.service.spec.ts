import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import { Logger } from '@nestjs/common';
import { RecommendationsDTO } from '@netweave/api-types';
import { MailService } from '../../mail/mail.service';
import { Member } from '../../members/member.entity';
import { MembersService } from '../../members/members.service';
import { RecommendationMailsService } from './recommendation-mails.service';

const member = (id: number, email: string | null): Member =>
  ({
    id,
    name: `Member ${id}`,
    contact: null,
    email,
    resourcesRequirements: [
      { category: 'premises', resources: `Raum von ${id}` },
      { category: 'land', resources: `Fläche von ${id}` },
      { category: 'equipment', resources: '  ' },
    ],
  }) as Member;

const overall = (seekerId: number, ...matchIds: number[]) => ({
  kind: 'overall' as const,
  seekerId,
  matches: matchIds.map((memberId) => ({
    memberId,
    category: 'premises' as const,
    rankingScore: 80,
    matchingScore: 80,
    cultureScore: null,
  })),
});

const recommendations: RecommendationsDTO = {
  strategy: 'max-category',
  weights: { matching: 80, culture: 20, nep: 0 },
  members: [overall(1, 2, 3), overall(2, 1), overall(3, 1), overall(4)],
};

describe('RecommendationMailsService', () => {
  let service: RecommendationMailsService;
  let membersService: jest.Mocked<Pick<MembersService, 'getAllWithResources'>>;
  let mailService: jest.Mocked<Pick<MailService, 'sendMail'>>;
  const originalFlag = process.env.SEND_RECOMMENDATION_MAILS;

  beforeEach(() => {
    delete process.env.SEND_RECOMMENDATION_MAILS;

    membersService = {
      getAllWithResources: jest
        .fn()
        .mockResolvedValue([
          member(1, 'one@example.com'),
          member(2, 'two@example.com'),
          member(3, null),
          member(4, 'four@example.com'),
        ]),
    };

    mailService = { sendMail: jest.fn().mockResolvedValue(true) };

    service = new RecommendationMailsService(
      membersService as unknown as MembersService,
      mailService as unknown as MailService,
    );
  });

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.SEND_RECOMMENDATION_MAILS;
    } else {
      process.env.SEND_RECOMMENDATION_MAILS = originalFlag;
    }

    jest.restoreAllMocks();
  });

  const recipients = () => mailService.sendMail.mock.calls.map(([m]) => m.to);

  it('mails every member with an email address and at least one reachable match', async () => {
    await service.sendForRun(42, recommendations);

    // 3 has no email address, 4 has no matches
    expect(recipients()).toEqual(['one@example.com', 'two@example.com']);
    expect(mailService.sendMail.mock.calls[0][0].html).toContain(
      'two@example.com',
    );
  });

  it('uses the confirmed new email instead of the one the invitation was sent to', async () => {
    membersService.getAllWithResources.mockResolvedValue([
      {
        ...member(1, 'new-one@example.com'),
        invitation: { email: 'one@example.com' },
      } as Member,
      member(2, 'two@example.com'),
    ]);

    await service.sendForRun(42, recommendations);

    expect(recipients()).toEqual(['new-one@example.com', 'two@example.com']);
    // also listed with the new email as a match in the mails of others
    const { html } = mailService.sendMail.mock.calls[1][0];
    expect(html).toContain('mailto:new-one@example.com');
    expect(html).not.toContain('mailto:one@example.com');
  });

  it('explains every match with its resources of the recommended category', async () => {
    await service.sendForRun(42, recommendations);

    const html = mailService.sendMail.mock.calls[0][0].html;
    expect(html).toContain(
      'Ressourcen in der Kategorie Räumlichkeiten: Raum von 2',
    );
    expect(html).not.toContain('Fläche von 2');
  });

  it('logs how many mails were sent, failed and skipped', async () => {
    mailService.sendMail.mockResolvedValueOnce(false);
    const log = jest.spyOn(Logger.prototype, 'log');

    await service.sendForRun(42, recommendations);

    expect(log).toHaveBeenCalledWith(
      'Recommendation mails of matching run 42: 1 sent, 1 failed, 2 skipped',
    );
  });

  it('sends nothing when SEND_RECOMMENDATION_MAILS is false', async () => {
    process.env.SEND_RECOMMENDATION_MAILS = 'false';

    await service.sendForRun(42, recommendations);

    expect(membersService.getAllWithResources).not.toHaveBeenCalled();
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it('never throws, e.g. when loading the members fails', async () => {
    membersService.getAllWithResources.mockRejectedValue(new Error('db down'));
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    await expect(
      service.sendForRun(42, recommendations),
    ).resolves.toBeUndefined();

    expect(error).toHaveBeenCalled();
  });
});
