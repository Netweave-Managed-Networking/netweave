/** not true = 0, somewhat true = 1, moderately true = 2, fairly true = 3, very true = 4 */
export const LIKERT_ANSWERS = [0, 1, 2, 3, 4] as const;

export type LikertAnswer = (typeof LIKERT_ANSWERS)[number];

export const LIKERT_MAX: LikertAnswer = 4;
