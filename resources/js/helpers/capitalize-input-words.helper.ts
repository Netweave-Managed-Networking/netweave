import { capitalizeWords } from './capitalize-words.helper';

/**
 * capitalizes each word of the input value in place.
 * @returns the capitalized value.
 */
export const capitalizeInputWords = ({ target }: { target: HTMLInputElement }) => {
  const selectionStart = target.selectionStart;
  const value = capitalizeWords(target.value);
  target.value = value;
  target.setSelectionRange(selectionStart, selectionStart);
  return value;
};
