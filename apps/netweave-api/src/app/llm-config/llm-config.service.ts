import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LlmConfigDTO,
  LlmConfigTestError,
  LlmConfigTestResultDTO,
  LlmConfigUpdateDTO,
} from '@netweave/api-types';
import { APICallError, generateText, LoadAPIKeyError } from 'ai';
import { Repository } from 'typeorm';
import { decryptSecret, encryptSecret } from '../mail/crypto.util';
import { createLanguageModel, LlmAccess } from '../matchings/llm/llm-config';
import { LlmConfig } from './llm-config.entity';

const TEST_TIMEOUT_MS = 30_000;
const TEST_PROMPT = 'Antworte nur mit: OK';

@Injectable()
export class LlmConfigService {
  private readonly logger = new Logger(LlmConfigService.name);

  public constructor(
    @InjectRepository(LlmConfig)
    private readonly repository: Repository<LlmConfig>,
  ) {
    this.logger.log(`LlmConfigService initialized`);
  }

  public async get(): Promise<LlmConfigDTO> {
    const row = await this.findRow();
    if (!row) return { source: 'netweave', own: null };

    return {
      source: 'own',
      own: {
        provider: row.provider,
        model: row.model,
        baseUrl: row.baseUrl,
        hasApiKey: !!row.apiKeyEncrypted,
        updatedAt: row.updatedAt,
      },
    };
  }

  public async getOwnAccess(): Promise<LlmAccess | null> {
    const row = await this.findRow();
    if (!row) return null;

    return {
      provider: row.provider,
      model: row.model,
      apiKey: row.apiKeyEncrypted
        ? decryptSecret(row.apiKeyEncrypted)
        : undefined,
      baseUrl: row.baseUrl ?? undefined,
    };
  }

  public async update(
    dto: LlmConfigUpdateDTO,
    updatedById: number,
  ): Promise<LlmConfigDTO> {
    const existing = await this.findRow();
    const access = toAccess(dto);
    const keepKey = keepsStoredApiKey(access, dto.apiKey, existing);
    const newKey = newApiKeyOf(access, dto.apiKey, keepKey);

    await this.repository.save({
      id: existing?.id,
      provider: access.provider,
      model: access.model,
      baseUrl: access.baseUrl ?? null,
      apiKeyEncrypted: keepKey
        ? existing?.apiKeyEncrypted
        : newKey && encryptSecret(newKey),
      updatedBy: { id: updatedById },
    });
    this.logger.log(
      `Own llm access set to ${access.provider}/${access.model} by user ${updatedById}`,
    );

    return this.get();
  }

  public async remove(removedById: number): Promise<LlmConfigDTO> {
    await this.repository.createQueryBuilder().delete().execute();
    this.logger.log(
      `Own llm access removed by user ${removedById}, using the netweave llm access`,
    );
    return this.get();
  }

  public async test(dto: LlmConfigUpdateDTO): Promise<LlmConfigTestResultDTO> {
    const existing = await this.findRow();
    const access = toAccess(dto);
    const keepKey = keepsStoredApiKey(access, dto.apiKey, existing);
    const apiKey =
      keepKey && existing?.apiKeyEncrypted
        ? decryptSecret(existing.apiKeyEncrypted)
        : newApiKeyOf(access, dto.apiKey, keepKey);

    try {
      await generateText({
        model: createLanguageModel({ ...access, apiKey: apiKey ?? undefined }),
        prompt: TEST_PROMPT,
        maxRetries: 0,
        timeout: TEST_TIMEOUT_MS,
      });
      return { success: true, error: null };
    } catch (error) {
      const category = testErrorOf(error);
      // provider messages may echo (parts of) the api key, so only the status code is logged
      const status = APICallError.isInstance(error) ? error.statusCode : null;
      this.logger.warn(
        `Llm config test with ${access.provider}/${access.model} failed: ${category}${status ? ` (status ${status})` : ''}`,
      );
      return { success: false, error: category };
    }
  }

  private findRow(): Promise<LlmConfig | null> {
    return this.repository.findOne({
      where: {},
      order: { id: 'ASC' },
      select: {
        id: true,
        provider: true,
        model: true,
        baseUrl: true,
        apiKeyEncrypted: true,
        updatedAt: true,
      },
    });
  }
}

const toAccess = ({
  provider,
  model,
  baseUrl,
}: LlmConfigUpdateDTO): Omit<LlmAccess, 'apiKey'> => ({
  provider,
  model: model.trim(),
  baseUrl:
    provider === 'openai-compatible' ? baseUrl?.trim() || undefined : undefined,
});

// a changed base url would send the stored key to another server
const keepsStoredApiKey = (
  { provider, baseUrl }: Omit<LlmAccess, 'apiKey'>,
  apiKey: string | undefined,
  existing: LlmConfig | null,
): boolean =>
  apiKey === undefined &&
  !!existing?.apiKeyEncrypted &&
  existing.provider === provider &&
  (existing.baseUrl ?? undefined) === baseUrl;

const newApiKeyOf = (
  { provider }: Omit<LlmAccess, 'apiKey'>,
  apiKey: string | undefined,
  keepKey: boolean,
): string | null => {
  const key = apiKey?.trim() || null;
  // without a key, the provider sdks fall back to env vars like OPENAI_API_KEY, which may be netweave's
  if (!key && !keepKey && provider !== 'openai-compatible') {
    throw new BadRequestException(
      `An api key is required for provider ${provider}`,
    );
  }
  return key;
};

const testErrorOf = (error: unknown): LlmConfigTestError => {
  if (LoadAPIKeyError.isInstance(error)) return 'unauthorized';
  if ((error as { name?: unknown } | null)?.name === 'TimeoutError') {
    return 'timeout';
  }
  if (!APICallError.isInstance(error)) return 'unknown';

  switch (error.statusCode) {
    case undefined:
      return 'unreachable';
    case 401:
    case 403:
      return 'unauthorized';
    case 404:
      return 'not-found';
    case 429:
      return 'rate-limited';
    default:
      return 'unknown';
  }
};
