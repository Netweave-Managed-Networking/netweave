import {
  MemberRecommendationsDTO,
  RESOURCE_REQUIREMENT_CATEGORY_TEXTS,
  ResourceRequirementCategory,
} from '@netweave/api-types';
import { SendMailInput } from '../../mail/mail.service';

export interface RecommendationContact {
  name: string;
  contact: string | null;
  email: string;
}

interface Section {
  heading: string | null;
  items: string[];
}

const SUBJECT = 'Netweave: Deine Vernetzungsempfehlungen';

/** matches without an email address are left out; returns null if no match is left */
export const buildRecommendationMail = (
  recommendations: MemberRecommendationsDTO,
  recipient: RecommendationContact,
  contacts: ReadonlyMap<number, RecommendationContact>,
): SendMailInput | null => {
  const body = toSections(recommendations, contacts)
    .filter(({ items }) => items.length > 0)
    .map(renderSection)
    .join('');

  if (!body) {
    return null;
  }

  const greeting = escapeHtml(recipient.contact ?? recipient.name);

  return {
    to: recipient.email,
    subject: SUBJECT,
    html:
      `<p>Hallo ${greeting},</p>` +
      '<p>auf Basis der aktuellen Matching-Berechnung empfehlen wir dir, mit folgenden Netzwerkteilnehmern Kontakt aufzunehmen:</p>' +
      body,
  };
};

const toSections = (
  recommendations: MemberRecommendationsDTO,
  contacts: ReadonlyMap<number, RecommendationContact>,
): Section[] => {
  if (recommendations.kind === 'per-category') {
    return recommendations.categories.map(({ category, matches }) => ({
      heading: categoryLabel(category),
      items: matches.flatMap(({ memberId }) =>
        listItem(contacts.get(memberId)),
      ),
    }));
  }

  return [
    {
      heading: null,
      items: recommendations.matches.flatMap(({ memberId, category }) =>
        listItem(contacts.get(memberId), categoryLabel(category)),
      ),
    },
  ];
};

const renderSection = ({ heading, items }: Section): string => {
  const title = heading ? `<h3>${escapeHtml(heading)}</h3>` : '';

  return `${title}<ul>${items.join('')}</ul>`;
};

const listItem = (
  match: RecommendationContact | undefined,
  category?: string,
): string[] => {
  if (!match) {
    return [];
  }

  const email = escapeHtml(match.email);

  const parts = [
    `<strong>${escapeHtml(match.name)}</strong>`,
    match.contact ? `Ansprechpartner: ${escapeHtml(match.contact)}` : null,
    category ? `Kategorie: ${escapeHtml(category)}` : null,
    `<a href="mailto:${email}">${email}</a>`,
  ];

  return [`<li>${parts.filter(Boolean).join(' – ')}</li>`];
};

const categoryLabel = (category: ResourceRequirementCategory): string =>
  RESOURCE_REQUIREMENT_CATEGORY_TEXTS[category].label;

/** names and contacts are user input */
const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
