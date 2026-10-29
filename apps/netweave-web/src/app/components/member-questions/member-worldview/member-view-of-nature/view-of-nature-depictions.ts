import { ViewOfNature } from '@netweave/api-types';

export interface ViewOfNatureDepiction {
  text: string;
  /** the ball (nature) on a landscape, as drawn in VN_*.svg */
  image: {
    viewBox: string;
    landscape: string;
    ball: { cx: number; cy: number };
  };
}

/** display texts and images per answer; the Record type ensures none is missing */
export const VIEW_OF_NATURE_DEPICTIONS: Record<
  ViewOfNature,
  ViewOfNatureDepiction
> = {
  robust: {
    text: 'Die Natur ist äußerst robust. Auch nach großen Störungen stellt sich das Gleichgewicht wieder ein.',
    image: {
      viewBox: '114 44 196 108',
      landscape: 'M120 50 C150 95, 165 145, 212 145 C259 145, 274 95, 304 50',
      ball: { cx: 212, cy: 135 },
    },
  },
  fragile: {
    text: 'Die Natur befindet sich in einem zerbrechlichen Gleichgewicht. Kleinste Störungen können katastrophale Folgen haben.',
    image: {
      viewBox: '109 22 206 130',
      landscape: 'M115 145 C155 80, 185 50, 212 50 C239 50, 269 80, 309 145',
      ball: { cx: 212, cy: 36 },
    },
  },
  unpredictable: {
    text: 'Die Natur ist spontan und unberechenbar. Wir wissen nicht, was geschehen wird.',
    image: {
      viewBox: '114 94 196 35',
      landscape: 'M120 122 L304 122',
      ball: { cx: 212, cy: 109 },
    },
  },
  reasonably_robust: {
    text: 'Innerhalb bestimmter Grenzen ist die Natur robust. Sind die Störungen gering, kehrt die Natur in ihr Gleichgewicht zurück.',
    image: {
      viewBox: '109 72 206 84',
      landscape:
        'M115 150 C130 95, 155 78, 173 78 C191 78, 191 112, 212 112 C233 112, 233 78, 251 78 C269 78, 294 95, 309 150',
      ball: { cx: 212, cy: 108 },
    },
  },
};
