import {
  GeneratedRequirementsDTO,
  RESOURCE_REQUIREMENT_CATEGORIES,
  ResourceRequirementCategory,
} from '@netweave/api-types';
import { generateText, LanguageModel, Output } from 'ai';
import { z } from 'zod';
import { LlmConfig, LlmReasoning } from '../../matchings/llm/llm-config';
import { requirementsPrompt } from './requirements-prompt';

export const REQUIREMENTS_GENERATOR = Symbol('REQUIREMENTS_GENERATOR');

const MAX_RETRIES = 3;

const requirementsSchema = z.object(
  Object.fromEntries(
    RESOURCE_REQUIREMENT_CATEGORIES.map((category) => [category, z.string()]),
  ) as Record<ResourceRequirementCategory, z.ZodString>, // fromEntries loses the key type
);

/** asks an llm for the requirements a project description implies, per category */
export class RequirementsGenerator {
  private readonly timeoutMs: number;
  private readonly reasoning: LlmReasoning;

  public constructor(
    private readonly model: LanguageModel,
    options: Pick<LlmConfig, 'timeoutMs' | 'reasoning'>,
  ) {
    this.timeoutMs = options.timeoutMs;
    this.reasoning = options.reasoning;
  }

  public async generate(
    projectDescription: string,
  ): Promise<GeneratedRequirementsDTO> {
    const { output } = await generateText({
      model: this.model,
      prompt: requirementsPrompt(projectDescription.trim()),
      output: Output.object({ schema: requirementsSchema }),
      maxRetries: MAX_RETRIES,
      timeout: this.timeoutMs,
      reasoning: this.reasoning,
    });

    return Object.fromEntries(
      RESOURCE_REQUIREMENT_CATEGORIES.flatMap((category) => {
        const requirements = output[category].trim();
        return requirements ? [[category, requirements]] : [];
      }),
    );
  }
}
