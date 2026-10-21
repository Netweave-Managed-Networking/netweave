import { CultureOrientation } from '@netweave/api-types';

/**
 * by the culture of the recipient, then by the culture of the recommended member;
 * G = Clan, I = Adhokratie, W = Markt, S = Hierarchie. placeholders until the final texts are delivered
 */
export const CULTURE_HINTS: Record<
  CultureOrientation,
  Record<CultureOrientation, string>
> = {
  G: {
    G: 'Clan -> Clan',
    I: 'Clan -> Adhokratie',
    W: 'Clan -> Markt',
    S: 'Clan -> Hierarchie',
  },
  I: {
    G: 'Adhokratie -> Clan',
    I: 'Adhokratie -> Adhokratie',
    W: 'Adhokratie -> Markt',
    S: 'Adhokratie -> Hierarchie',
  },
  W: {
    G: 'Markt -> Clan',
    I: 'Markt -> Adhokratie',
    W: 'Markt -> Markt',
    S: 'Markt -> Hierarchie',
  },
  S: {
    G: 'Hierarchie -> Clan',
    I: 'Hierarchie -> Adhokratie',
    W: 'Hierarchie -> Markt',
    S: 'Hierarchie -> Hierarchie',
  },
};
