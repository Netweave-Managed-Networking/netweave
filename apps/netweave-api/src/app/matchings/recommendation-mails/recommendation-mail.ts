import {
  CultureOrientation,
  MemberRecommendationsDTO,
  RankedMatchDTO,
  RESOURCE_REQUIREMENT_CATEGORY_TEXTS,
  ResourceRequirementCategory,
} from '@netweave/api-types';
import { SendMailInput } from '../../mail/mail.service';
import { escapeHtml } from '../../utils/escape-html';
import { CULTURE_HINTS } from './culture-hints';

export interface RecommendationContact {
  name: string;
  contact: string | null;
  email: string;
  /** resource field per category; categories without resources are left out */
  resources: Partial<Record<ResourceRequirementCategory, string>>;
  /** null without culture answers */
  culture: CultureOrientation | null;
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
      body +
      cultureHints(recommendations, recipient, contacts),
  };
};

// both ranking strategies base every recommended match on a single category, so only that category's
// resources are listed; a strategy ranking on all categories would pass all of them to listItem
const toSections = (
  recommendations: MemberRecommendationsDTO,
  contacts: ReadonlyMap<number, RecommendationContact>,
): Section[] => {
  if (recommendations.kind === 'per-category') {
    return recommendations.categories.map(({ category, matches }) => ({
      heading: categoryLabel(category),
      items: matches.flatMap(({ memberId }) =>
        listItem(contacts.get(memberId), [category]),
      ),
    }));
  }

  return [
    {
      heading: null,
      items: recommendations.matches.flatMap(({ memberId, category }) =>
        listItem(contacts.get(memberId), [category]),
      ),
    },
  ];
};

const renderSection = ({ heading, items }: Section): string => {
  const title = heading ? `<h3>${escapeHtml(heading)}</h3>` : '';

  return `${title}<ul>${items.join('')}</ul>`;
};

/** `categories` are the ones the recommendation is based on, only their resources explain it */
const listItem = (
  match: RecommendationContact | undefined,
  categories: ResourceRequirementCategory[],
): string[] => {
  if (!match) {
    return [];
  }

  const email = escapeHtml(match.email);

  const parts = [
    `<strong>${escapeHtml(match.name)}</strong>`,
    match.contact ? `Ansprechpartner: ${escapeHtml(match.contact)}` : null,
    `<a href="mailto:${email}">${email}</a>`,
  ];

  const resources = categories.map(
    (category) =>
      `<li>Ressourcen in der Kategorie ${escapeHtml(categoryLabel(category))}: ` +
      `${multiline(match.resources[category] ?? 'keine Angabe')}</li>`,
  );

  return [
    `<li>${parts.filter(Boolean).join(' – ')}<ul>${resources.join('')}</ul></li>`,
  ];
};

const cultureHints = (
  recommendations: MemberRecommendationsDTO,
  recipient: RecommendationContact,
  contacts: ReadonlyMap<number, RecommendationContact>,
): string => {
  if (!recipient.culture) {
    return '';
  }

  const items: string[] = [];

  for (const memberId of recommendedMemberIds(recommendations)) {
    const match = contacts.get(memberId);

    if (!match?.culture) {
      continue;
    }

    const hint = CULTURE_HINTS[recipient.culture][match.culture];

    items.push(
      `<li><strong>${escapeHtml(match.name)}</strong>: ${escapeHtml(hint)}</li>`,
    );
  }

  if (items.length === 0) {
    return '';
  }

  return renderSection({
    heading: 'Hinweise zur kulturellen Stimmigkeit',
    items,
  });
};

/** in the order of the mail, every member only once */
const recommendedMemberIds = (
  recommendations: MemberRecommendationsDTO,
): Set<number> => {
  const matches: RankedMatchDTO[] =
    recommendations.kind === 'per-category'
      ? recommendations.categories.flatMap(({ matches }) => matches)
      : recommendations.matches;

  return new Set(matches.map(({ memberId }) => memberId));
};

const categoryLabel = (category: ResourceRequirementCategory): string =>
  RESOURCE_REQUIREMENT_CATEGORY_TEXTS[category].label;

const multiline = (text: string): string =>
  escapeHtml(text).replace(/\r?\n/g, '<br>');
