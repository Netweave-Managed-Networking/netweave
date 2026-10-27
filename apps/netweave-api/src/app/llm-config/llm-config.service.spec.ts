import { BadRequestException, Logger } from '@nestjs/common';
import { LlmConfigUpdateDTO } from '@netweave/api-types';
import { APICallError, generateText } from 'ai';
import { Repository } from 'typeorm';
import { decryptSecret, encryptSecret } from '../mail/crypto.util';
import * as llmConfig from '../matchings/llm/llm-config';
import { LlmConfig } from './llm-config.entity';
import { LlmConfigService } from './llm-config.service';

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  generateText: jest.fn(),
}));

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;

type MockRepo = Partial<Record<keyof Repository<LlmConfig>, jest.Mock>>;

const apiCallError = (statusCode: number | undefined, message: string) =>
  new APICallError({
    message,
    url: 'https://api.example.com/v1/chat/completions',
    requestBodyValues: {},
    statusCode,
  });

describe('LlmConfigService', () => {
  let service: LlmConfigService;
  let repository: MockRepo;
  let deleteExecute: jest.Mock;

  const originalEnv = process.env;
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');

  const storedRow = (overrides: Partial<LlmConfig> = {}) => ({
    id: 1,
    provider: 'openai',
    model: 'gpt-x',
    baseUrl: null,
    apiKeyEncrypted: encryptSecret('sk-stored'),
    updatedAt,
    ...overrides,
  });

  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test_jwt_secret' };
    deleteExecute = jest.fn().mockResolvedValue({ affected: 1 });
    repository = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        delete: () => ({ execute: deleteExecute }),
      })),
    };
    service = new LlmConfigService(
      repository as unknown as Repository<LlmConfig>,
    );
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    mockGenerateText.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('get', () => {
    it('reports the netweave llm access when there is no own one', async () => {
      expect(await service.get()).toEqual({ source: 'netweave', own: null });
    });

    it('reports the own llm access with hasApiKey instead of the key', async () => {
      repository.findOne?.mockResolvedValue(storedRow());

      const result = await service.get();

      expect(result).toEqual({
        source: 'own',
        own: {
          provider: 'openai',
          model: 'gpt-x',
          baseUrl: null,
          hasApiKey: true,
          updatedAt,
        },
      });
      expect(JSON.stringify(result)).not.toContain('sk-stored');
    });
  });

  describe('getOwnAccess', () => {
    it('is null without an own llm access', async () => {
      expect(await service.getOwnAccess()).toBeNull();
    });

    it('returns the own llm access with the decrypted api key', async () => {
      repository.findOne?.mockResolvedValue(storedRow());

      expect(await service.getOwnAccess()).toEqual({
        provider: 'openai',
        model: 'gpt-x',
        apiKey: 'sk-stored',
        baseUrl: undefined,
      });
    });

    it('throws rather than falling back when the stored key cannot be decrypted', async () => {
      repository.findOne?.mockResolvedValue(storedRow());
      process.env.JWT_SECRET = 'rotated_secret';

      await expect(service.getOwnAccess()).rejects.toThrow();
    });
  });

  describe('update', () => {
    const dto = (overrides: Partial<LlmConfigUpdateDTO> = {}) =>
      ({
        provider: 'openai',
        model: 'gpt-x',
        ...overrides,
      }) as LlmConfigUpdateDTO;

    const savedRow = () => repository.save?.mock.calls[0][0];

    it('stores a new api key encrypted only', async () => {
      await service.update(dto({ apiKey: ' sk-new ' }), 7);

      const saved = savedRow();
      expect(saved).toMatchObject({
        id: undefined,
        provider: 'openai',
        model: 'gpt-x',
        baseUrl: null,
        updatedBy: { id: 7 },
      });
      expect(saved.apiKeyEncrypted).not.toContain('sk-new');
      expect(decryptSecret(saved.apiKeyEncrypted)).toBe('sk-new');
    });

    it('keeps the stored api key when none is given and the provider stays the same', async () => {
      const row = storedRow();
      repository.findOne?.mockResolvedValue(row);

      await service.update(dto({ model: 'gpt-y' }), 7);

      expect(savedRow()).toMatchObject({
        id: 1,
        model: 'gpt-y',
        apiKeyEncrypted: row.apiKeyEncrypted,
      });
    });

    it('requires a new api key when the provider changes', async () => {
      repository.findOne?.mockResolvedValue(storedRow());

      await expect(
        service.update(dto({ provider: 'anthropic' }), 7),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('requires an api key for hosted providers, so the sdks never fall back to env keys', async () => {
      await expect(service.update(dto(), 7)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(
        service.update(dto({ apiKey: '  ' }), 7),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('allows openai-compatible without api key, and clears a stored one with an empty one', async () => {
      repository.findOne?.mockResolvedValue(
        storedRow({ provider: 'openai-compatible' }),
      );

      await service.update(
        dto({
          provider: 'openai-compatible',
          baseUrl: 'http://ollama:11434/v1',
          apiKey: '',
        }),
        7,
      );

      expect(savedRow()).toMatchObject({
        baseUrl: 'http://ollama:11434/v1',
        apiKeyEncrypted: null,
      });
    });

    it('requires a new api key when the base url changes, so the stored key never goes to another server', async () => {
      repository.findOne?.mockResolvedValue(
        storedRow({
          provider: 'openai-compatible',
          baseUrl: 'https://llm.example.com/v1',
        }),
      );
      const moved = dto({
        provider: 'openai-compatible',
        baseUrl: 'https://other.example.com',
      });
      const createModel = jest.spyOn(llmConfig, 'createLanguageModel');

      await service.test(moved);
      await service.update(moved, 7);

      expect(createModel).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: undefined }),
      );
      expect(savedRow().apiKeyEncrypted).toBeNull();
    });

    it('ignores a base url for providers with an official api', async () => {
      await service.update(
        dto({ apiKey: 'sk-new', baseUrl: 'https://evil.example.com' }),
        7,
      );

      expect(savedRow().baseUrl).toBeNull();
    });
  });

  describe('remove', () => {
    it('deletes the own llm access including its key and reports the netweave access', async () => {
      const result = await service.remove(7);

      expect(deleteExecute).toHaveBeenCalled();
      expect(result).toEqual({ source: 'netweave', own: null });
    });
  });

  describe('test', () => {
    const dto = { provider: 'openai', model: 'gpt-x' } as LlmConfigUpdateDTO;

    it('reports success when the llm answers', async () => {
      mockGenerateText.mockResolvedValue({ text: 'OK' } as never);

      expect(await service.test({ ...dto, apiKey: 'sk-new' })).toEqual({
        success: true,
        error: null,
      });
    });

    it('uses the stored api key when none is given', async () => {
      repository.findOne?.mockResolvedValue(storedRow());
      mockGenerateText.mockResolvedValue({ text: 'OK' } as never);
      const createModel = jest.spyOn(llmConfig, 'createLanguageModel');

      await service.test(dto);

      expect(createModel).toHaveBeenCalledWith({
        provider: 'openai',
        model: 'gpt-x',
        apiKey: 'sk-stored',
        baseUrl: undefined,
      });
      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({ maxRetries: 0 }),
      );
    });

    it.each([
      [401, 'unauthorized'],
      [403, 'unauthorized'],
      [404, 'not-found'],
      [429, 'rate-limited'],
      [500, 'unknown'],
      [undefined, 'unreachable'],
    ] as const)('maps status %s to %s', async (statusCode, error) => {
      jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      mockGenerateText.mockRejectedValue(apiCallError(statusCode, 'failed'));

      expect(await service.test({ ...dto, apiKey: 'sk-new' })).toEqual({
        success: false,
        error,
      });
    });

    it('maps a timeout', async () => {
      jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      mockGenerateText.mockRejectedValue(
        new DOMException('timeout exceeded', 'TimeoutError'),
      );

      expect(await service.test({ ...dto, apiKey: 'sk-new' })).toMatchObject({
        error: 'timeout',
      });
    });

    it('neither returns nor logs the provider message, which may echo the key', async () => {
      const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      mockGenerateText.mockRejectedValue(
        apiCallError(401, 'Incorrect API key provided: sk-secret-key'),
      );

      const result = await service.test({ ...dto, apiKey: 'sk-secret-key' });

      expect(JSON.stringify(result)).not.toContain('sk-secret');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(warn.mock.calls)).not.toContain('sk-secret');
    });

    it('rejects a hosted provider without any api key before calling it', async () => {
      await expect(service.test(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(mockGenerateText).not.toHaveBeenCalled();
    });
  });
});
