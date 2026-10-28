import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  ValidateIf,
} from 'class-validator';
import { LLM_PROVIDERS, LlmProvider } from './llm-provider.type';

export class LlmConfigUpdateDTO {
  @IsIn(LLM_PROVIDERS)
  declare public provider: LlmProvider;

  @IsString()
  @Matches(/\S/)
  declare public model: string;

  @IsOptional()
  @IsString()
  declare public apiKey?: string;

  @ValidateIf((dto: LlmConfigUpdateDTO) => dto.provider === 'openai-compatible')
  @IsUrl({ protocols: ['http', 'https'], require_tld: false })
  declare public baseUrl?: string;
}
