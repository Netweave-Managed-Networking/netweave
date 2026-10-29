/** Naturanschauung: which depiction of nature a member identifies with */
export const VIEW_OF_NATURE_OPTIONS = [
  'robust',
  'fragile',
  'unpredictable',
  'reasonably_robust',
] as const;

export type ViewOfNature = (typeof VIEW_OF_NATURE_OPTIONS)[number];
