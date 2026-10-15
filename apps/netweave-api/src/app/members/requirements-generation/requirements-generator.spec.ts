import { MockLanguageModelV4 } from 'ai/test';
import 'reflect-metadata'; // the api-types (imported for the categories) contain decorated dto classes; nest loads it outside of tests
import { RequirementsGenerator } from './requirements-generator';

/** a model answering with `answer`, remembering the prompts it got */
const mockModel = (answer: string) => {
  const prompts: string[] = [];
  const model = new MockLanguageModelV4({
    doGenerate: async ({ prompt }) => {
      prompts.push(JSON.stringify(prompt));
      return {
        content: [{ type: 'text', text: answer }],
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
      };
    },
  });
  return { model, prompts };
};

const options = { timeoutMs: 1000, reasoning: 'provider-default' as const };

const answer = (requirements: Record<string, string>) =>
  JSON.stringify({
    competencies: '',
    financial_resources: '',
    premises: '',
    land: '',
    equipment: '',
    networks: '',
    helping_hands: '',
    ...requirements,
  });

describe('RequirementsGenerator', () => {
  it('sends the project description and returns the requirements of the categories the llm filled', async () => {
    const { model, prompts } = mockModel(
      answer({
        premises: 'Wir brauchen einen Raum für 20 Personen.',
        helping_hands: '  Wir brauchen Helfer beim Aufbau.\n',
        land: '   ',
      }),
    );
    const generator = new RequirementsGenerator(model, options);

    const result = await generator.generate(
      '  Wir wollen ein Repair-Café eröffnen.  ',
    );

    expect(result).toEqual({
      premises: 'Wir brauchen einen Raum für 20 Personen.',
      helping_hands: 'Wir brauchen Helfer beim Aufbau.',
    });
    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toContain('Wir wollen ein Repair-Café eröffnen.');
    expect(prompts[0]).toContain('Räumlichkeiten');
  });

  it('fails when the llm does not answer with the requirements object', async () => {
    const { model } = mockModel('Leider kann ich das nicht.');
    const generator = new RequirementsGenerator(model, options);

    await expect(generator.generate('Ein Projekt')).rejects.toThrow();
  });
});
