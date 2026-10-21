import { buildUpdateReminderMail } from './update-reminder-mail';

const recipient = {
  name: 'Acme e.V.',
  contact: 'Erika Musterfrau',
  email: 'nt@example.com',
  lastUpdatedAt: new Date('2026-04-02T10:00:00Z'),
};
const link = 'https://netweave.example/member-questions/abc_-123';

describe('buildUpdateReminderMail', () => {
  it('goes to the given email', () => {
    expect(buildUpdateReminderMail(recipient, link).to).toBe('nt@example.com');
  });

  it('asks to check the data, tells the date of the last update and links to the form', () => {
    const { subject, html } = buildUpdateReminderMail(recipient, link);

    expect(subject).toContain('Netweave');
    expect(html).toContain('Hallo Erika Musterfrau,');
    expect(html).toContain('korrekt und vollständig');
    expect(html).toContain('am 2. April 2026');
    expect(html).toContain(`<a href="${link}">${link}</a>`);
  });

  it('formats the date in german time', () => {
    const { html } = buildUpdateReminderMail(
      { ...recipient, lastUpdatedAt: new Date('2026-03-31T23:30:00Z') },
      link,
    );

    expect(html).toContain('am 1. April 2026');
  });

  it('greets with the name when there is no contact', () => {
    const { html } = buildUpdateReminderMail(
      { ...recipient, contact: null },
      link,
    );

    expect(html).toContain('Hallo Acme e.V.,');
  });

  it('escapes user input', () => {
    const { html } = buildUpdateReminderMail(
      { ...recipient, contact: '<b>Erika</b>' },
      link,
    );

    expect(html).toContain('Hallo &lt;b&gt;Erika&lt;/b&gt;,');
  });
});
