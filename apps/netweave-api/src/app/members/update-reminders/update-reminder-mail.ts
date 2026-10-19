import { SendMailInput } from '../../mail/mail.service';
import { escapeHtml } from '../../utils/escape-html';

export interface UpdateReminderRecipient {
  name: string;
  contact: string | null;
  email: string;
  lastUpdatedAt: Date;
}

const SUBJECT = 'Netweave: Sind deine Angaben noch aktuell?';

const DATE_FORMAT = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'long',
  timeZone: 'Europe/Berlin',
});

/** `link` leads to the member data form of the recipient */
export const buildUpdateReminderMail = (
  recipient: UpdateReminderRecipient,
  link: string,
): SendMailInput => {
  const greeting = escapeHtml(recipient.contact ?? recipient.name);
  const lastUpdated = DATE_FORMAT.format(recipient.lastUpdatedAt);
  const href = escapeHtml(link);

  return {
    to: recipient.email,
    subject: SUBJECT,
    html:
      `<p>Hallo ${greeting},</p>` +
      '<p>bitte prüfe, ob deine Angaben noch korrekt und vollständig sind, damit Netweave dir weiterhin möglichst passende Matching-Vorschläge machen kann.</p>' +
      `<p>Zuletzt aktualisiert hast du deine Angaben am ${lastUpdated}.</p>` +
      '<p>Über folgenden Link kannst du deine Angaben ansehen und bei Bedarf ändern:</p>' +
      `<p><a href="${href}">${href}</a></p>`,
  };
};
