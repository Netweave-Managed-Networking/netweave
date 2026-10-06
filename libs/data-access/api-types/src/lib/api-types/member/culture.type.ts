/** themenfelder of the organizational culture questionnaire, each a typical decision situation of cross-organizational cooperation */
export const CULTURE_TOPICS = ['Z1', 'Z2', 'Z3', 'Z4'] as const;

export type CultureTopic = (typeof CULTURE_TOPICS)[number];

/** G = Gemeinschaft, I = Innovation, W = Ziel und Wirkung, S = Struktur; never shown to members */
export const CULTURE_ORIENTATIONS = ['G', 'I', 'W', 'S'] as const;

export type CultureOrientation = (typeof CULTURE_ORIENTATIONS)[number];

/** internal id of one statement, e.g. `Z1-G` */
export type CultureItemId = `${CultureTopic}-${CultureOrientation}`;

export const toCultureItemId = (
  topic: CultureTopic,
  orientation: CultureOrientation,
): CultureItemId => `${topic}-${orientation}`;

export const toCultureTopic = (itemId: CultureItemId): CultureTopic =>
  itemId.split('-')[0] as CultureTopic;

export const CULTURE_ITEM_IDS: readonly CultureItemId[] =
  CULTURE_TOPICS.flatMap((topic) =>
    CULTURE_ORIENTATIONS.map((orientation) =>
      toCultureItemId(topic, orientation),
    ),
  );
