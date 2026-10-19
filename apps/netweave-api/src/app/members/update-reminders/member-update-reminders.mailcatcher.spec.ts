import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MailConfig } from '../../mail/mail-config.entity';
import { MailService } from '../../mail/mail.service';
import { MemberUpdateReminder } from './member-update-reminder.entity';
import {
  DueMember,
  MemberUpdateRemindersService,
} from './member-update-reminders.service';

/**
 * sends real update reminders over smtp to the mailcatcher of docker-compose.dev.yml and checks what arrived;
 * the mails are left there to be looked at in its web ui.
 * opt-in, as it needs the running container:
 * MAILCATCHER_URL=http://localhost:8025 npx nx test netweave-api --testPathPatterns=mailcatcher
 */
const MAILCATCHER_URL = process.env.MAILCATCHER_URL;
const SMTP_PORT = process.env.MAILCATCHER_SMTP_PORT ?? '1025';

// unique per run, so the search only finds the mails of this run
const runTag = Date.now();
const email = (name: string) => `${name}-${runTag}@mailcatcher-test.example`;

const dueMembers: DueMember[] = [
  {
    id: 1,
    name: 'Nachbarschaftsgarten',
    contact: 'Erika Muster',
    email: email('member-1'),
    lastUpdatedAt: new Date('2026-04-02T10:00:00Z'),
    invitationId: 101,
    token: 'token-of-member-1',
  },
  {
    id: 2,
    name: 'Werkstatt <Hobelbank>',
    contact: null,
    // e.g. confirmed after a change, the invitation went to another address
    email: email('member-2-changed'),
    lastUpdatedAt: new Date('2025-12-31T23:30:00Z'),
    invitationId: 102,
    token: 'token-of-member-2',
  },
];

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
  'MemberUpdateRemindersService with mailcatcher',
  () => {
    const originalEnv = { ...process.env };
    const reminders = {
      query: jest.fn((sql: string) =>
        Promise.resolve(sql.includes('FROM "members"') ? dueMembers : []),
      ),
      insert: jest.fn(),
    };

    beforeAll(async () => {
      Object.assign(process.env, {
        WEB_APP_URL: 'http://localhost:4200',
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

      const service = new MemberUpdateRemindersService(
        reminders as unknown as Repository<MemberUpdateReminder>,
        new MailService(mailConfigs),
      );

      await service.sendDue();
    });

    afterAll(() => {
      process.env = originalEnv;
      jest.restoreAllMocks();
    });

    it('delivers the reminder with the date of the last update and the link to the form', async () => {
      const mail = await caughtMail(email('member-1'));

      expect(mail.Subject).toBe('Netweave: Sind deine Angaben noch aktuell?');
      expect(mail.HTML).toContain('Hallo Erika Muster,');
      expect(mail.HTML).toContain('korrekt und vollständig');
      expect(mail.HTML).toContain('am 2. April 2026');
      expect(mail.HTML).toContain(
        'href="http://localhost:4200/member-questions/token-of-member-1"',
      );
    });

    it('delivers to the current email, greeting by name in german time', async () => {
      const mail = await caughtMail(email('member-2-changed'));

      expect(mail.HTML).toContain('Hallo Werkstatt &lt;Hobelbank&gt;,');
      expect(mail.HTML).toContain('am 1. Januar 2026');
      expect(mail.HTML).toContain('/member-questions/token-of-member-2');
    });

    it('records both reminders as sent', () => {
      expect(reminders.insert.mock.calls).toEqual([
        [{ memberId: 1, email: email('member-1') }],
        [{ memberId: 2, email: email('member-2-changed') }],
      ]);
    });
  },
);
