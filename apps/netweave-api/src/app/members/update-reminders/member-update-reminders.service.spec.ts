import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { MemberUpdateReminder } from './member-update-reminder.entity';
import {
  DueMember,
  MemberUpdateRemindersService,
} from './member-update-reminders.service';

const dueMember = (id: number): DueMember => ({
  id,
  name: `Member ${id}`,
  contact: null,
  email: `member-${id}@example.com`,
  lastUpdatedAt: new Date('2026-01-01T12:00:00Z'),
  invitationId: 100 + id,
  token: `token-${id}`,
});

const isDueQuery = (sql: string) => sql.includes('FROM "members"');

describe('MemberUpdateRemindersService', () => {
  let service: MemberUpdateRemindersService;
  let repository: Record<'query' | 'insert', jest.Mock>;
  let mailService: Record<'sendMail', jest.Mock>;
  let dueMembers: DueMember[];
  const originalEnv = process.env;

  const create = () =>
    new MemberUpdateRemindersService(
      repository as unknown as Repository<MemberUpdateReminder>,
      mailService as unknown as MailService,
    );

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      WEB_APP_URL: 'https://netweave.example',
      MEMBER_UPDATE_REMINDER_INTERVAL: '3 months',
    };
    dueMembers = [dueMember(1), dueMember(2)];
    repository = {
      query: jest.fn((sql: string) =>
        Promise.resolve(isDueQuery(sql) ? dueMembers : []),
      ),
      insert: jest.fn(),
    };
    mailService = { sendMail: jest.fn().mockResolvedValue(true) };
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    service = create();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  const dueQueryCalls = () =>
    repository.query.mock.calls.filter(([sql]) => isDueQuery(sql));
  const extendCalls = () =>
    repository.query.mock.calls.filter(([sql]) => sql.includes('UPDATE'));

  it('looks for due members with the interval from the env', async () => {
    await service.sendDue();

    expect(dueQueryCalls()).toEqual([[expect.any(String), ['3 months']]]);
  });

  it('mails each due member a link to its form at its current email', async () => {
    await service.sendDue();

    expect(mailService.sendMail).toHaveBeenCalledTimes(2);
    const [mail] = mailService.sendMail.mock.calls[0];
    expect(mail.to).toBe('member-1@example.com');
    expect(mail.html).toContain(
      'https://netweave.example/member-questions/token-1',
    );
  });

  it('records each sent reminder with the email it went to', async () => {
    await service.sendDue();

    expect(repository.insert.mock.calls).toEqual([
      [{ memberId: 1, email: 'member-1@example.com' }],
      [{ memberId: 2, email: 'member-2@example.com' }],
    ]);
  });

  it('keeps the link of the invitation valid before sending', async () => {
    mailService.sendMail.mockImplementation(() => {
      expect(extendCalls()).toHaveLength(1);
      return Promise.resolve(true);
    });
    dueMembers = [dueMember(1)];

    await service.sendDue();

    expect(extendCalls()).toEqual([[expect.any(String), [101, '3 months']]]);
  });

  it('does not record a failed mail, so it is tried again next run', async () => {
    mailService.sendMail.mockResolvedValueOnce(false);

    await service.sendDue();

    expect(repository.insert.mock.calls).toEqual([
      [{ memberId: 2, email: 'member-2@example.com' }],
    ]);
  });

  it('sends nothing when no member is due', async () => {
    dueMembers = [];

    await service.sendDue();

    expect(mailService.sendMail).not.toHaveBeenCalled();
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it('never throws', async () => {
    repository.query.mockRejectedValue(new Error('db down'));

    await expect(service.sendDue()).resolves.toBeUndefined();
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('skips a run while the previous one is still sending', async () => {
    let finishMail: (sent: boolean) => void = () => undefined;
    mailService.sendMail.mockImplementationOnce(
      () => new Promise((resolve) => (finishMail = resolve)),
    );
    dueMembers = [dueMember(1)];

    const first = service.sendDue();
    await new Promise(process.nextTick);
    await service.sendDue();
    finishMail(true);
    await first;

    expect(dueQueryCalls()).toHaveLength(1);

    await service.sendDue();
    expect(dueQueryCalls()).toHaveLength(2);
  });
});
