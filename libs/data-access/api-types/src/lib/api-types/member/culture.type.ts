export const CULTURE_TOPICS = ['Z1', 'Z2', 'Z3', 'Z4'] as const;

export type CultureTopic = (typeof CULTURE_TOPICS)[number];

/** Gemeinschaft, Innovation, Ziel und Wirkung, Struktur; never shown to members */
export const CULTURE_ORIENTATIONS = ['G', 'I', 'W', 'S'] as const;

export type CultureOrientation = (typeof CULTURE_ORIENTATIONS)[number];

export type CultureItemId = `${CultureTopic}-${CultureOrientation}`;

export const toCultureItemId = (
  topic: CultureTopic,
  orientation: CultureOrientation,
): CultureItemId => `${topic}-${orientation}`;

export const parseCultureItemId = (itemId: CultureItemId) => {
  const [topic, orientation] = itemId.split('-') as [
    CultureTopic,
    CultureOrientation,
  ];
  return { topic, orientation };
};

export const CULTURE_ITEM_IDS: readonly CultureItemId[] =
  CULTURE_TOPICS.flatMap((topic) =>
    CULTURE_ORIENTATIONS.map((orientation) =>
      toCultureItemId(topic, orientation),
    ),
  );
