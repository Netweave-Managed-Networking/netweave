import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import { Logger } from '@nestjs/common';
import { RecommendationsDTO } from '@netweave/api-types';
import { Repository } from 'typeorm';
import { MailConfig } from '../../mail/mail-config.entity';
import { MailService } from '../../mail/mail.service';
import { Member } from '../../members/member.entity';
import { MembersService } from '../../members/members.service';
import { RecommendationMailsService } from './recommendation-mails.service';

/**
 * sends real recommendation mails over smtp to the mailcatcher of docker-compose.dev.yml and checks what arrived;
 * the mails are left there to be looked at in its web ui.
 * opt-in, as it needs the running container:
 * MAILCATCHER_URL=http://localhost:8025 npx nx test netweave-api --testPathPatterns=mailcatcher
 */
const MAILCATCHER_URL = process.env.MAILCATCHER_URL;
const SMTP_PORT = process.env.MAILCATCHER_SMTP_PORT ?? '1025';

// unique per run, so the search only finds the mails of this run
const runTag = Date.now();
const email = (name: string) => `${name}-${runTag}@mailcatcher-test.example`;

const member = (
  id: number,
  name: string,
  contact: string | null,
  resources: Record<string, string>,
): Member =>
  ({
    id,
    name,
    contact,
    email: email(`member-${id}`),
    resourcesRequirements: Object.entries(resources).map(
      ([category, text]) => ({ category, resources: text }),
    ),
  }) as Member;

const members = [
  member(1, 'Nachbarschaftsgarten', 'Erika Muster', {
    competencies: 'Wissen über ökologischen Gemüseanbau und Kompostierung.',
  }),
  member(2, 'Werkstatt Hobelbank', null, {
    equipment:
      'Voll ausgestattete Holzwerkstatt;\nHandwerkzeug und Schubkarren können ausgeliehen werden.',
    competencies: 'Schreinermeister im Team, wir bauen Hochbeete.',
  }),
  member(3, 'Stadtteilverein Mitte', 'Max Beispiel', {
    land: 'Brachfläche von ca. 300 m² hinter dem Vereinsheim.',
    helping_hands: 'Rund 40 Ehrenamtliche für Aktionstage.',
  }),
];

const match = (memberId: number) => ({
  memberId,
  rankingScore: 80,
  matchingScore: 80,
  cultureScore: null,
});

const recommendations: RecommendationsDTO = {
  strategy: 'mixed, to see both layouts',
  weights: { matching: 80, culture: 20, nep: 0 },
  members: [
    // category-separation layout
    {
      kind: 'per-category',
      seekerId: 1,
      categories: [
        { category: 'land', matches: [match(3)] },
        { category: 'equipment', matches: [match(2)] },
        { category: 'helping_hands', matches: [match(3)] },
      ],
    },
    // max-category layout
    {
      kind: 'overall',
      seekerId: 2,
      matches: [
        { ...match(3), category: 'helping_hands' },
        { ...match(1), category: 'competencies' },
      ],
    },
  ],
};

interface MailpitMessage {
  ID: string;
  Subject: string;
  HTML: string;
}

const caughtMail = async (to: string): Promise<MailpitMessage> => {
  const query = encodeURIComponent(`to:"${to}"`);

  // smtp has accepted the mail when sendMail resolves, the short retry only covers mailpit's indexing
  for (let attempt = 0; attempt < 10; attempt++) {
    const search = await fetch(
      `${MAILCATCHER_URL}/api/v1/search?query=${query}`,
    );
    const { messages } = (await search.json()) as {
      messages: { ID: string }[];
    };

    if (messages.length > 0) {
      const message = await fetch(
        `${MAILCATCHER_URL}/api/v1/message/${messages[0].ID}`,
      );
      return (await message.json()) as MailpitMessage;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`no mail to ${to} caught by ${MAILCATCHER_URL}`);
};

(MAILCATCHER_URL ? describe : describe.skip)(
  'RecommendationMailsService with mailcatcher',
  () => {
    const originalEnv = { ...process.env };

    beforeAll(async () => {
      Object.assign(process.env, {
        SEND_RECOMMENDATION_MAILS: 'true',
        SMTP_HOST: new URL(MAILCATCHER_URL as string).hostname,
        SMTP_PORT,
        SMTP_SECURE: 'false',
        SMTP_USER: '',
        SMTP_PASSWORD: '',
      });
      jest.spyOn(Logger.prototype, 'log').mockImplementation();

      // no db row, so the smtp settings come from the env above
      const mailConfigs = {
        findOne: jest.fn().mockResolvedValue(null),
      } as unknown as Repository<MailConfig>;
      const membersService = {
        getAllWithResources: jest.fn().mockResolvedValue(members),
      } as unknown as MembersService;

      const service = new RecommendationMailsService(
        membersService,
        new MailService(mailConfigs),
      );

      await service.sendForRun(42, recommendations);
    });

    afterAll(() => {
      process.env = originalEnv;
      jest.restoreAllMocks();
    });

    it('delivers the per-category mail with the resources of each category', async () => {
      const mail = await caughtMail(email('member-1'));

      expect(mail.Subject).toBe('Netweave: Deine Vernetzungsempfehlungen');
      expect(mail.HTML).toContain('Hallo Erika Muster,');
      expect(mail.HTML).toContain(
        'Ressourcen in der Kategorie Flächen: Brachfläche von ca. 300 m² hinter dem Vereinsheim.',
      );
      expect(mail.HTML).toContain(
        'Ressourcen in der Kategorie Helfende Hände: Rund 40 Ehrenamtliche für Aktionstage.',
      );
      expect(mail.HTML).toContain(
        'Voll ausgestattete Holzwerkstatt;<br>Handwerkzeug',
      );
      // only the category the match is recommended for
      expect(mail.HTML).not.toContain('Schreinermeister');
    });

    it('delivers the overall mail with the resources of the best category', async () => {
      const mail = await caughtMail(email('member-2'));

      expect(mail.HTML).toContain('Hallo Werkstatt Hobelbank,');
      expect(mail.HTML).toContain(
        'Ressourcen in der Kategorie Kompetenzen: Wissen über ökologischen Gemüseanbau und Kompostierung.',
      );
      expect(mail.HTML).not.toContain('Brachfläche');
    });

    it('sends no mail to a member without recommendations', async () => {
      await expect(caughtMail(email('member-3'))).rejects.toThrow();
    });
  },
);
