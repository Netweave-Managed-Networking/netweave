import 'reflect-metadata'; // the api-types (imported for the categories) contain decorated dto classes; nest loads it outside of tests
import { Logger } from '@nestjs/common';
import { ResourceRequirementCategory } from '@netweave/api-types';
import { MockLanguageModelV4 } from 'ai/test';
import { MemberResourceRequirement } from '../members/member-resource-requirement.entity';
import { Member } from '../members/member.entity';
import {
  LLM_MATCHING_CATEGORIES,
  LlmMatchingStrategy,
} from './llm-matching.strategy';

type Entry = {
  category: ResourceRequirementCategory;
  resources?: string | null;
  requirements?: string | null;
};

const member = (id: number, entries: Entry[]): Member =>
  ({
    id,
    resourcesRequirements: entries.map((e) => ({
      resources: null,
      requirements: null,
      ...e,
    })) as MemberResourceRequirement[],
  }) as Member;

/** a model answering with whatever `answer` returns for the prompt it got */
const mockModel = (answer: (prompt: string) => string | Promise<string>) =>
  new MockLanguageModelV4({
    doGenerate: async ({ prompt }) => ({
      content: [{ type: 'text', text: await answer(JSON.stringify(prompt)) }],
      finishReason: { unified: 'stop', raw: 'stop' },
      usage: {
        inputTokens: {
          total: 1,
          noCache: 1,
          cacheRead: undefined,
          cacheWrite: undefined,
        },
        outputTokens: { total: 1, text: 1, reasoning: undefined },
      },
      warnings: [],
    }),
  });

const options = {
  concurrency: 5,
  timeoutMs: 1000,
  reasoning: 'provider-default' as const,
};

describe('LlmMatchingStrategy', () => {
  it('asks the llm once per category the seeker needs and the potential match offers, and stores each score', async () => {
    const model = mockModel((prompt) =>
      prompt.includes('Werkstatt') ? '80' : '30',
    );
    const strategy = new LlmMatchingStrategy(model, options);

    const seeker = member(1, [
      { category: 'premises', requirements: 'Werkstatt gesucht' },
      { category: 'competencies', requirements: 'Buchhaltung' },
    ]);
    const potentialMatch = member(2, [
      { category: 'premises', resources: 'Halle mit Werkbank' },
      { category: 'competencies', resources: 'Steuerberatung' },
    ]);

    const result = await strategy.score(seeker, potentialMatch);

    expect(model.doGenerateCalls).toHaveLength(2);
    expect(result.details?.categories).toEqual(
      expect.arrayContaining([
        { category: 'premises', score: 80 },
        { category: 'competencies', score: 30 },
      ]),
    );
    expect(result.score).toBe(55); // average, until the real aggregation exists
  });

  it('fills the prompt with the requirement of the seeker and the resource of the potential match', async () => {
    const model = mockModel(() => '50');
    const strategy = new LlmMatchingStrategy(model, options);

    await strategy.score(
      member(1, [
        {
          category: 'equipment',
          requirements: 'Bohrmaschine',
          resources: 'Laptop',
        },
      ]),
      member(2, [
        {
          category: 'equipment',
          requirements: 'Beamer',
          resources: 'Akkuschrauber',
        },
      ]),
    );

    const prompt = JSON.stringify(model.doGenerateCalls[0].prompt);
    expect(prompt).toContain('Bedarf:\\nBohrmaschine');
    expect(prompt).toContain('Ressource:\\nAkkuschrauber');
    expect(prompt).not.toContain('Laptop');
    expect(prompt).not.toContain('Beamer');
  });

  it('is unidirectional: scores the requirements of the seeker, never those of the potential match', async () => {
    const model = mockModel(() => '70');
    const strategy = new LlmMatchingStrategy(model, options);
    const a = member(1, [{ category: 'land', requirements: 'Acker' }]);
    const b = member(2, [{ category: 'land', resources: 'Wiese' }]);

    expect((await strategy.score(a, b)).details?.categories).toEqual([
      { category: 'land', score: 70 },
    ]);
    expect((await strategy.score(b, a)).details?.categories).toEqual([]); // b needs nothing
    expect(model.doGenerateCalls).toHaveLength(1);
  });

  it('covers every category except networks', async () => {
    expect(LLM_MATCHING_CATEGORIES).toHaveLength(6);
    expect(LLM_MATCHING_CATEGORIES).not.toContain('networks');

    const model = mockModel(() => '10');
    const strategy = new LlmMatchingStrategy(model, options);
    const all = (field: 'requirements' | 'resources') =>
      [...LLM_MATCHING_CATEGORIES, 'networks' as const].map((category) => ({
        category,
        [field]: `${field} ${category}`,
      }));

    const result = await strategy.score(
      member(1, all('requirements')),
      member(2, all('resources')),
    );

    expect(model.doGenerateCalls).toHaveLength(6);
    expect(result.details?.categories.map((c) => c.category)).toEqual(
      LLM_MATCHING_CATEGORIES,
    );
  });

  it('scores 0 without asking when the potential match offers nothing in a needed category', async () => {
    const model = mockModel(() => '90');
    const strategy = new LlmMatchingStrategy(model, options);

    const result = await strategy.score(
      member(1, [
        { category: 'premises', requirements: 'Büro' },
        { category: 'land', requirements: 'Garten' },
      ]),
      member(2, [{ category: 'premises', resources: '   ' }]), // whitespace only
    );

    expect(model.doGenerateCalls).toHaveLength(0);
    expect(result).toEqual({
      score: 0,
      details: {
        categories: [
          { category: 'premises', score: 0 },
          { category: 'land', score: 0 },
        ],
      },
    });
  });

  it('scores 0 with empty details when the seeker needs nothing', async () => {
    const model = mockModel(() => '90');
    const strategy = new LlmMatchingStrategy(model, options);

    const result = await strategy.score(
      member(1, [{ category: 'premises', resources: 'Büro' }]),
      member(2, [{ category: 'premises', resources: 'Halle' }]),
    );

    expect(result).toEqual({ score: 0, details: { categories: [] } });
  });

  it('passes the configured reasoning level to the model', async () => {
    const model = mockModel(() => '50');
    const strategy = new LlmMatchingStrategy(model, {
      ...options,
      reasoning: 'none',
    });

    await strategy.score(
      member(1, [{ category: 'premises', requirements: 'Büro' }]),
      member(2, [{ category: 'premises', resources: 'Halle' }]),
    );

    expect(model.doGenerateCalls[0].reasoning).toBe('none');
  });

  it('logs the raw llm answer of every assessed category as debug', async () => {
    const debug = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    const strategy = new LlmMatchingStrategy(
      mockModel(() => ' 85\n'),
      options,
    );

    await strategy.score(
      member(1, [{ category: 'premises', requirements: 'Büro' }]),
      member(2, [{ category: 'premises', resources: 'Halle' }]),
    );

    expect(debug).toHaveBeenCalledWith(
      'Member 2 for member 1, premises: llm answered " 85\\n", score 85',
    );
    debug.mockRestore();
  });

  it('stores an unusable answer as not assessable (null), warns, and leaves it out of the average', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const model = mockModel((prompt) =>
      prompt.includes('yyyy')
        ? 'Bitte gib die Werte für Bedarf und Ressource ein.'
        : '80',
    );
    const strategy = new LlmMatchingStrategy(model, options);

    const result = await strategy.score(
      member(1, [
        { category: 'premises', requirements: 'yyyyyyyy' },
        { category: 'land', requirements: 'Garten' },
      ]),
      member(2, [
        { category: 'premises', resources: 'xxxxxxxx' },
        { category: 'land', resources: 'Wiese' },
      ]),
    );

    expect(result).toEqual({
      score: 80, // not 40: null is not assessable, not "no match"
      details: {
        categories: [
          { category: 'premises', score: null },
          { category: 'land', score: 80 },
        ],
      },
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Member 2 for member 1, premises'),
    );
    warn.mockRestore();
  });

  it('scores 0 when no category could be assessed', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const strategy = new LlmMatchingStrategy(
      mockModel(() => 'keine Ahnung'),
      options,
    );

    const result = await strategy.score(
      member(1, [{ category: 'premises', requirements: 'Büro' }]),
      member(2, [{ category: 'premises', resources: 'Halle' }]),
    );

    expect(result).toEqual({
      score: 0,
      details: { categories: [{ category: 'premises', score: null }] },
    });
    jest.restoreAllMocks();
  });

  it('drops queued llm calls once the signal is aborted, e.g. because the run failed', async () => {
    const abort = new AbortController();
    const model = mockModel(async () => {
      abort.abort(new Error('run failed')); // fails during the first call
      return '50';
    });
    const strategy = new LlmMatchingStrategy(model, {
      ...options,
      concurrency: 1,
    });
    const all = (field: 'requirements' | 'resources') =>
      LLM_MATCHING_CATEGORIES.map((category) => ({ category, [field]: 'x' }));

    await expect(
      strategy.score(
        member(1, all('requirements')),
        member(2, all('resources')),
        abort.signal,
      ),
    ).rejects.toThrow();
    await new Promise((resolve) => setImmediate(resolve));

    expect(model.doGenerateCalls.length).toBeLessThan(6);
  });

  it('never runs more llm calls at once than its concurrency, across concurrent score() calls', async () => {
    let running = 0;
    let maxRunning = 0;
    const model = mockModel(async () => {
      maxRunning = Math.max(maxRunning, ++running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running--;
      return '50';
    });
    const strategy = new LlmMatchingStrategy(model, {
      ...options,
      concurrency: 2,
    });
    const all = (field: 'requirements' | 'resources') =>
      LLM_MATCHING_CATEGORIES.map((category) => ({ category, [field]: 'x' }));
    const seeker = member(1, all('requirements'));

    await Promise.all(
      [2, 3, 4].map((id) =>
        strategy.score(seeker, member(id, all('resources'))),
      ),
    );

    expect(model.doGenerateCalls).toHaveLength(18);
    expect(maxRunning).toBe(2);
  });
});
