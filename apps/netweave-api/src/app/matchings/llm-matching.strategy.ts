import { Logger } from '@nestjs/common';
import {
  MatchingDetailsDTO,
  RESOURCE_REQUIREMENT_CATEGORIES,
  ResourceRequirementCategory,
} from '@netweave/api-types';
import { generateText, LanguageModel } from 'ai';
import { Member } from '../members/member.entity';
import {
  ConcurrencyLimit,
  createConcurrencyLimit,
} from './llm/concurrency-limit';
import { coveragePrompt, parseCoverageScore } from './llm/coverage-prompt';
import { LlmConfig, LlmReasoning } from './llm/llm-config';
import { MatchingResult, MatchingStrategy } from './matching-strategy';

/** networks are matched differently (out of scope of the llm matching) */
export const LLM_MATCHING_CATEGORIES = RESOURCE_REQUIREMENT_CATEGORIES.filter(
  (category) => category !== 'networks',
);

const MAX_RETRIES = 3; // per llm call, on top of the first attempt; covers rate limits and transient provider errors

/**
 * asks an llm, per category, how well the resources of the potential match cover the requirements of the seeker.
 * categories without a requirement of the seeker are left out (nothing needed, nothing to match); a missing resource
 * scores 0 without asking. an unusable answer is stored as null (not assessable) and logged, instead of failing the
 * whole (long, expensive) run. the overall score is the average of the assessable category scores for now, see NETW-35.
 * llm calls are limited to `concurrency` at once across all concurrent score() calls of this instance.
 */
export class LlmMatchingStrategy implements MatchingStrategy {
  private readonly logger = new Logger(LlmMatchingStrategy.name);
  private readonly limit: ConcurrencyLimit;
  private readonly timeoutMs: number;
  private readonly reasoning: LlmReasoning;

  public constructor(
    private readonly model: LanguageModel,
    options: Pick<LlmConfig, 'concurrency' | 'timeoutMs' | 'reasoning'>,
  ) {
    this.limit = createConcurrencyLimit(options.concurrency);
    this.timeoutMs = options.timeoutMs;
    this.reasoning = options.reasoning;
  }

  public async score(
    seeker: Member,
    potentialMatch: Member,
    signal?: AbortSignal,
  ): Promise<MatchingResult> {
    const entries = LLM_MATCHING_CATEGORIES.flatMap((category) => {
      const requirement = textOf(seeker, category, 'requirements');
      return requirement
        ? [
            {
              category,
              requirement,
              resource: textOf(potentialMatch, category, 'resources'),
            },
          ]
        : [];
    });

    const categories: MatchingDetailsDTO['categories'] = await Promise.all(
      entries.map(async ({ category, requirement, resource }) => {
        if (!resource) return { category, score: 0 };
        const answer = await this.askCoverage(requirement, resource, signal);
        const score = parseCoverageScore(answer);
        if (score === null) {
          this.logger.warn(
            `Member ${potentialMatch.id} for member ${seeker.id}, ${category}: unusable llm answer ` +
              `"${answer.slice(0, 100)}", stored as not assessable`,
          );
        } else {
          this.logger.debug(
            `Member ${potentialMatch.id} for member ${seeker.id}, ${category}: llm answered ` +
              `${JSON.stringify(answer)}, score ${score}`,
          );
        }
        return { category, score };
      }),
    );

    const assessed = categories.flatMap(({ score }) =>
      score === null ? [] : [score],
    );
    const score =
      assessed.length === 0
        ? 0
        : Math.round(assessed.reduce((sum, s) => sum + s, 0) / assessed.length);

    return { score, details: { categories } };
  }

  /** the raw answer of the llm; queued calls are dropped once `signal` is aborted, running ones are cancelled */
  private askCoverage(
    requirement: string,
    resource: string,
    signal: AbortSignal | undefined,
  ): Promise<string> {
    return this.limit(async () => {
      signal?.throwIfAborted();
      const { text } = await generateText({
        model: this.model,
        prompt: coveragePrompt(requirement, resource),
        temperature: 0,
        maxRetries: MAX_RETRIES,
        timeout: this.timeoutMs,
        reasoning: this.reasoning,
        abortSignal: signal,
      });
      return text;
    });
  }
}

const textOf = (
  member: Member,
  category: ResourceRequirementCategory,
  field: 'resources' | 'requirements',
): string =>
  member.resourcesRequirements
    ?.find((rr) => rr.category === category)
    ?.[field]?.trim() ?? '';
