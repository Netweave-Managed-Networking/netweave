import { capitalizeWords } from './capitalize-words.helper';

describe.only('capitalizeWords', () => {
  it('should capitalize a word', () => {
    expect(capitalizeWords('hallo')).toEqual('Hallo');
  });

  it('should capitalize each word of a sentence', () => {
    expect(capitalizeWords('hallo, ich bin marvin')).toEqual(
      'Hallo, Ich Bin Marvin'
    );
  });

  it('should capitalize each word of a sentence with umlauts', () => {
    expect(capitalizeWords('hallöchen, ich heiße marvin')).toEqual(
      'Hallöchen, Ich Heiße Marvin'
    );
  });
});
