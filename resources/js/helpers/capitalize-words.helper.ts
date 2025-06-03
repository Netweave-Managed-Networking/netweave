export const capitalizeWords = (sentence: string) => sentence.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
