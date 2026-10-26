/** the Umweltanschauung questions of the ecological worldview; the instrument is fixed, so only these ids are stored */
export const VIEW_OF_ENVIRONMENT_ITEM_IDS = [
  'UA1',
  'UA2',
  'UA3',
  'UA4',
  'UA5',
  'UA6',
  'UA7',
  'UA8',
  'UA9',
  'UA10',
] as const;

export type ViewOfEnvironmentItemId =
  (typeof VIEW_OF_ENVIRONMENT_ITEM_IDS)[number];

/** their answers count as LIKERT_MAX - answer in the score; never shown to members */
export const VIEW_OF_ENVIRONMENT_REVERSED_ITEM_IDS: ReadonlySet<ViewOfEnvironmentItemId> =
  new Set(['UA2', 'UA3', 'UA6', 'UA8', 'UA9']);
