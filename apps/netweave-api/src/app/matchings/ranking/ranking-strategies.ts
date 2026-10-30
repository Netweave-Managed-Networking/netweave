import { Logger } from '@nestjs/common';
import { RankingWeightsDTO } from '@netweave/api-types';
import {
  CategorySeparationMatching,
  MaxCategoryMatching,
} from './category-matching';
import { EuclideanMaxCultureWeighting } from './culture-weighting';
import { ComposedRankingStrategy, RankingStrategy } from './ranking-strategy';

const DEFAULT_WEIGHTS: RankingWeightsDTO = {
  matching: 80,
  culture: 10,
  // the ecological world view, split equally between its two components
  viewOfEnvironment: 5,
  viewOfNature: 5,
  nep: 0,
};

export const RANKING_STRATEGIES = {
  'category-separation': () =>
    new ComposedRankingStrategy(
      'category-separation',
      new CategorySeparationMatching(),
      new EuclideanMaxCultureWeighting(),
      DEFAULT_WEIGHTS,
    ),

  'max-category': () =>
    new ComposedRankingStrategy(
      'max-category',
      new MaxCategoryMatching(),
      new EuclideanMaxCultureWeighting(),
      DEFAULT_WEIGHTS,
    ),
} satisfies Record<string, () => RankingStrategy>;

export type RankingStrategyName = keyof typeof RANKING_STRATEGIES;

export const DEFAULT_RANKING_STRATEGY: RankingStrategyName =
  'category-separation';

export const createRankingStrategy = (
  env: NodeJS.ProcessEnv = process.env,
): RankingStrategy => {
  const logger = new Logger('RankingStrategy');
  const name = env.RANKING_STRATEGY?.trim() || DEFAULT_RANKING_STRATEGY;

  if (!isRankingStrategyName(name)) {
    logger.warn(
      `Unknown RANKING_STRATEGY "${name}", falling back to ${DEFAULT_RANKING_STRATEGY}`,
    );
  }

  const strategy = isRankingStrategyName(name)
    ? RANKING_STRATEGIES[name]()
    : RANKING_STRATEGIES[DEFAULT_RANKING_STRATEGY]();

  logger.log(`Using ${strategy.name} ranking`);
  return strategy;
};

const isRankingStrategyName = (name: string): name is RankingStrategyName =>
  Object.prototype.hasOwnProperty.call(RANKING_STRATEGIES, name);
