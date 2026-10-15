// first: the api-types (imported for the categories) contain decorated dto classes; nest loads it outside of tests
import 'reflect-metadata';
import {
  RESOURCE_REQUIREMENT_CATEGORIES,
  RESOURCE_REQUIREMENT_CATEGORY_TEXTS,
} from '@netweave/api-types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  createLanguageModel,
  readLlmConfig,
} from '../../matchings/llm/llm-config';
import { RequirementsGenerator } from './requirements-generator';

/**
 * asks the llm from .env for real and prints what it generated, to judge the prompt by eye;
 * skipped unless started explicitly:
 * LLM_LIVE_TESTS=true npx nx test netweave-api --testPathPatterns=live --skip-nx-cache
 */
dotenv.config({ path: path.resolve(__dirname, '../../../../../../.env') });

const config = readLlmConfig(process.env);
const live = process.env['LLM_LIVE_TESTS'] === 'true' && !!config;

const PROJECT_DESCRIPTIONS = [
  `Wir wollen im Stadtteil ein Repair-Café eröffnen, in dem einmal im Monat Ehrenamtliche zusammen mit Besucherinnen und Besuchern kaputte Elektrogeräte, Fahrräder und Kleidung reparieren.`,
  `Wir planen einen Gemeinschaftsgarten auf einer Brachfläche, in dem Familien aus der Nachbarschaft Gemüse anbauen. Dazu soll es Workshops zu Kompostierung und Saatgut geben. Die Stadt hat uns eine Förderung in Aussicht gestellt, wir müssen aber einen Eigenanteil aufbringen.`,
  `Seniorinnen und Senioren sollen lernen, mit Smartphone und Tablet umzugehen, um z.B. Videotelefonate mit ihren Enkeln zu führen und Online-Banking sicher zu nutzen. Geplant sind wöchentliche Kurse in kleinen Gruppen.`,
  `Wir möchten mehr Menschen erreichen.`, // vague on purpose: little or nothing should come back
];

(live ? describe : describe.skip)('RequirementsGenerator (live llm)', () => {
  const generator =
    config && new RequirementsGenerator(createLanguageModel(config), config);

  it.each(PROJECT_DESCRIPTIONS)(
    'generates requirements for: %s',
    async (projectDescription) => {
      const result = await generator!.generate(projectDescription);

      const lines = RESOURCE_REQUIREMENT_CATEGORIES.flatMap((category) => {
        const requirements = result[category];
        if (!requirements) return [];
        const label = RESOURCE_REQUIREMENT_CATEGORY_TEXTS[category].label;
        return [
          `  ${label}:`,
          ...requirements.split('\n').map((line) => `    ${line}`),
        ];
      });
      console.log(
        [
          `${config!.provider}/${config!.model}`,
          `Projektbeschreibung: ${projectDescription}`,
          '',
          ...(lines.length ? lines : ['  (keine Bedarfe generiert)']),
        ].join('\n'),
      );

      for (const category of Object.keys(result)) {
        expect(RESOURCE_REQUIREMENT_CATEGORIES).toContain(category);
      }
    },
    5 * 60 * 1000, // a local model may take a while
  );
});
