import 'reflect-metadata'; // the api-types contain decorated dto classes; nest loads it outside of tests
import { MemberRecommendationsDTO } from '@netweave/api-types';
import { ECOLOGICAL_WORLD_VIEW_HINTS } from './ecological-world-view-hints';
import {
  buildRecommendationMail,
  RecommendationContact,
} from './recommendation-mail';

const match = (memberId: number) => ({
  memberId,
  rankingScore: 80,
  matchingScore: 80,
  cultureScore: null,
  viewOfEnvironmentScore: null,
  viewOfNatureScore: null,
});

const recipient: RecommendationContact = {
  name: 'Seeker e.V.',
  contact: 'Erika Muster',
  email: 'seeker@example.com',
  resources: {},
  culture: null,
  viewOfEnvironmentScore: null,
  viewOfNature: null,
};

const contacts = new Map<number, RecommendationContact>([
  [
    2,
    {
      name: 'Tafel',
      contact: 'Max',
      email: 'tafel@example.com',
      resources: { premises: 'Saal für 80 Personen', equipment: 'Kühlwagen' },
      culture: 'W',
      viewOfEnvironmentScore: 3,
      viewOfNature: 'fragile',
    },
  ],
  [
    3,
    {
      name: 'Werkstatt',
      contact: null,
      email: 'werkstatt@example.com',
      resources: { premises: 'Halle', helping_hands: 'Azubis\nab Mai' },
      culture: null,
      viewOfEnvironmentScore: null,
      viewOfNature: null,
    },
  ],
  [
    4,
    {
      name: 'Nachbarschaftshaus',
      contact: null,
      email: 'haus@example.com',
      resources: {},
      culture: 'G',
      viewOfEnvironmentScore: 2.2,
      viewOfNature: 'robust',
    },
  ],
]);

describe('buildRecommendationMail', () => {
  it('lists name, contact person and email of every match per category', () => {
    const recommendations: MemberRecommendationsDTO = {
      kind: 'per-category',
      seekerId: 1,
      categories: [
        { category: 'premises', matches: [match(2), match(3)] },
        { category: 'helping_hands', matches: [match(3)] },
      ],
    };

    const mail = buildRecommendationMail(recommendations, recipient, contacts);

    expect(mail?.to).toBe('seeker@example.com');
    expect(mail?.html).toContain('Hallo Erika Muster,');
    expect(mail?.html).toContain('<h3>Räumlichkeiten</h3>');
    expect(mail?.html).toContain('<h3>Helfende Hände</h3>');
    expect(mail?.html).toContain(
      '<strong>Tafel</strong> – Ansprechpartner: Max',
    );
    expect(mail?.html).toContain('mailto:tafel@example.com');
    expect(mail?.html).toContain('mailto:werkstatt@example.com');
  });

  it('names the category of every match for an overall ranking', () => {
    const recommendations: MemberRecommendationsDTO = {
      kind: 'overall',
      seekerId: 1,
      matches: [{ ...match(2), category: 'equipment' }],
    };

    const mail = buildRecommendationMail(recommendations, recipient, contacts);

    expect(mail?.html).not.toContain('<h3>');
    expect(mail?.html).toContain(
      'Ressourcen in der Kategorie Geräte / physische Ausstattung: Kühlwagen',
    );
  });

  it('lists only the resources of the category a match is recommended for', () => {
    const recommendations: MemberRecommendationsDTO = {
      kind: 'per-category',
      seekerId: 1,
      categories: [
        { category: 'premises', matches: [match(2)] },
        { category: 'helping_hands', matches: [match(3)] },
      ],
    };

    const mail = buildRecommendationMail(recommendations, recipient, contacts);

    expect(mail?.html).toContain(
      'Ressourcen in der Kategorie Räumlichkeiten: Saal für 80 Personen',
    );
    expect(mail?.html).toContain(
      'Ressourcen in der Kategorie Helfende Hände: Azubis<br>ab Mai',
    );
    expect(mail?.html).not.toContain('Kühlwagen');
    expect(mail?.html).not.toContain('Halle');
  });

  it('says so when a match has no resources in its category', () => {
    const recommendations: MemberRecommendationsDTO = {
      kind: 'overall',
      seekerId: 1,
      matches: [{ ...match(2), category: 'land' }],
    };

    const mail = buildRecommendationMail(recommendations, recipient, contacts);

    expect(mail?.html).toContain(
      'Ressourcen in der Kategorie Flächen: keine Angabe',
    );
  });

  it('leaves out matches without email and categories left empty by that', () => {
    const recommendations: MemberRecommendationsDTO = {
      kind: 'per-category',
      seekerId: 1,
      categories: [
        { category: 'premises', matches: [match(2), match(99)] },
        { category: 'land', matches: [match(99)] },
      ],
    };

    const mail = buildRecommendationMail(recommendations, recipient, contacts);

    expect(mail?.html.match(/<strong>/g)).toHaveLength(1);
    expect(mail?.html).not.toContain('Flächen');
  });

  it('returns null when no match is left to recommend', () => {
    const recommendations: MemberRecommendationsDTO = {
      kind: 'overall',
      seekerId: 1,
      matches: [{ ...match(99), category: 'land' }],
    };

    expect(
      buildRecommendationMail(recommendations, recipient, contacts),
    ).toBeNull();
  });

  it('greets with the member name if there is no contact person', () => {
    const recommendations: MemberRecommendationsDTO = {
      kind: 'overall',
      seekerId: 1,
      matches: [{ ...match(2), category: 'land' }],
    };

    const mail = buildRecommendationMail(
      recommendations,
      { ...recipient, contact: null },
      contacts,
    );

    expect(mail?.html).toContain('Hallo Seeker e.V.,');
  });

  it('escapes user input so it cannot inject markup', () => {
    const recommendations: MemberRecommendationsDTO = {
      kind: 'overall',
      seekerId: 1,
      matches: [{ ...match(4), category: 'land' }],
    };
    const evil = new Map<number, RecommendationContact>([
      [
        4,
        {
          name: '<script>x</script>',
          contact: null,
          email: 'a@b.c',
          resources: { land: '<img src=x>' },
          culture: 'G',
          viewOfEnvironmentScore: null,
          viewOfNature: null,
        },
      ],
    ]);

    const mail = buildRecommendationMail(
      recommendations,
      { ...recipient, culture: 'G' },
      evil,
    );

    expect(mail?.html).not.toContain('<script>');
    expect(mail?.html).toContain('&lt;script&gt;');
    expect(mail?.html).not.toContain('<img');
  });

  describe('hints on cultural coherence', () => {
    const clan: RecommendationContact = { ...recipient, culture: 'G' };
    const market: RecommendationContact = { ...recipient, culture: 'W' };

    const overall = (...memberIds: number[]): MemberRecommendationsDTO => ({
      kind: 'overall',
      seekerId: 1,
      matches: memberIds.map((memberId) => ({
        ...match(memberId),
        category: 'land',
      })),
    });

    /** everything from the hint heading to the end of the mail, null without hints */
    const hintSection = (
      seeker: RecommendationContact,
      recommendations: MemberRecommendationsDTO,
    ): string | null => {
      const html =
        buildRecommendationMail(recommendations, seeker, contacts)?.html ?? '';
      const start = html.indexOf('<h3>Hinweise zur kulturellen Stimmigkeit');

      return start === -1 ? null : html.slice(start);
    };

    it('lists the hint for each match at the end of the mail', () => {
      expect(hintSection(clan, overall(2, 4))).toBe(
        '<h3>Hinweise zur kulturellen Stimmigkeit</h3><ul>' +
          '<li><strong>Tafel</strong>: Clan -&gt; Markt</li>' +
          '<li><strong>Nachbarschaftshaus</strong>: Clan -&gt; Clan</li>' +
          '</ul>',
      );
    });

    it('picks the text by the direction from recipient to match', () => {
      expect(hintSection(clan, overall(2))).toContain('Clan -&gt; Markt');
      expect(hintSection(market, overall(4))).toContain('Markt -&gt; Clan');
    });

    it('lists a match recommended in several categories only once', () => {
      const recommendations: MemberRecommendationsDTO = {
        kind: 'per-category',
        seekerId: 1,
        categories: [
          { category: 'premises', matches: [match(2)] },
          { category: 'equipment', matches: [match(2)] },
        ],
      };

      expect(hintSection(clan, recommendations)).toBe(
        '<h3>Hinweise zur kulturellen Stimmigkeit</h3><ul>' +
          '<li><strong>Tafel</strong>: Clan -&gt; Markt</li>' +
          '</ul>',
      );
    });

    it('leaves out matches without culture answers or without email', () => {
      expect(hintSection(clan, overall(3, 2, 99))).toBe(
        '<h3>Hinweise zur kulturellen Stimmigkeit</h3><ul>' +
          '<li><strong>Tafel</strong>: Clan -&gt; Markt</li>' +
          '</ul>',
      );
    });

    it('has no hints when the recipient has no culture answers', () => {
      expect(hintSection(recipient, overall(2))).toBeNull();
    });

    it('has no hints when no match has culture answers', () => {
      expect(hintSection(clan, overall(3))).toBeNull();
    });
  });

  describe('hints on the ecological world view', () => {
    const seeker: RecommendationContact = {
      ...recipient,
      viewOfEnvironmentScore: 2,
      viewOfNature: 'fragile',
    };

    const overall = (...memberIds: number[]): MemberRecommendationsDTO => ({
      kind: 'overall',
      seekerId: 1,
      matches: memberIds.map((memberId) => ({
        ...match(memberId),
        category: 'land',
      })),
    });

    /** everything from the hint heading to the end of the mail, null without hints */
    const hintSection = (
      recipient: RecommendationContact,
      recommendations: MemberRecommendationsDTO,
    ): string | null => {
      const html =
        buildRecommendationMail(recommendations, recipient, contacts)?.html ??
        '';
      const start = html.indexOf(
        '<h3>Hinweise zur ökologischen Weltanschauung',
      );

      return start === -1 ? null : html.slice(start);
    };

    it('lists one combined hint per match at the end of the mail', () => {
      // Tafel: 3 - 2 = +1, same view of nature; Nachbarschaftshaus: 2.2 - 2 + 0.5 = +0.7
      expect(hintSection(seeker, overall(2, 4))).toBe(
        '<h3>Hinweise zur ökologischen Weltanschauung</h3><ul>' +
          `<li><strong>Tafel</strong>: ${ECOLOGICAL_WORLD_VIEW_HINTS['match-slightly-more']}</li>` +
          `<li><strong>Nachbarschaftshaus</strong>: ${ECOLOGICAL_WORLD_VIEW_HINTS['match-slightly-more']}</li>` +
          '</ul>',
      );
    });

    it('picks the text by the direction from recipient to match', () => {
      expect(
        hintSection({ ...seeker, viewOfEnvironmentScore: 4 }, overall(2)),
      ).toContain(ECOLOGICAL_WORLD_VIEW_HINTS['seeker-slightly-more']);
      expect(
        hintSection({ ...seeker, viewOfEnvironmentScore: 1 }, overall(2)),
      ).toContain(ECOLOGICAL_WORLD_VIEW_HINTS['match-clearly-more']);
    });

    it('does not reveal the view of environment or nature on its own', () => {
      const text = (hintSection(seeker, overall(2, 4)) ?? '').replace(
        /<[^>]+>/g,
        '',
      );

      expect(text).not.toContain('fragile');
      expect(text).not.toContain('robust');
      expect(text).not.toMatch(/\d/);
    });

    it('leaves out matches without world view answers or without email', () => {
      expect(hintSection(seeker, overall(3, 2, 99))).toBe(
        '<h3>Hinweise zur ökologischen Weltanschauung</h3><ul>' +
          `<li><strong>Tafel</strong>: ${ECOLOGICAL_WORLD_VIEW_HINTS['match-slightly-more']}</li>` +
          '</ul>',
      );
    });

    it('has no hints when the recipient has not answered the view of environment', () => {
      expect(
        hintSection({ ...seeker, viewOfEnvironmentScore: null }, overall(2)),
      ).toBeNull();
    });

    it('has no hints when the recipient has not chosen a view of nature', () => {
      expect(
        hintSection({ ...seeker, viewOfNature: null }, overall(2)),
      ).toBeNull();
    });
  });
});
