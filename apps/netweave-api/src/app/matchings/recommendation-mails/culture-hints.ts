import { CultureOrientation } from '@netweave/api-types';

/**
 * hint for the recipient of a recommendation mail, by the culture of the recipient and then by the culture of the
 * recommended member (G = Clan, I = Adhokratie, W = Markt, S = Hierarchie); directional, so G -> W differs from
 * W -> G. plain text, it is escaped in the mail. placeholders until the final texts are delivered
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
