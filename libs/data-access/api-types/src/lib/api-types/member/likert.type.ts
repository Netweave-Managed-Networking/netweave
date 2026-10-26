/** stimmt nicht = 0, stimmt wenig = 1, stimmt mittelmäßig = 2, stimmt ziemlich = 3, stimmt sehr = 4 */
export const LIKERT_ANSWERS = [0, 1, 2, 3, 4] as const;

export type LikertAnswer = (typeof LIKERT_ANSWERS)[number];

export const LIKERT_MAX: LikertAnswer = 4;
