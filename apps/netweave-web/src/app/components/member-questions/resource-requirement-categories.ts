import { ResourceRequirementCategory } from '@netweave/api-types';

interface CategoryText {
  label: string;
  description: string;
}

/** display texts per category; the Record type ensures no category is missing */
export const RESOURCE_REQUIREMENT_CATEGORY_TEXTS: Record<
  ResourceRequirementCategory,
  CategoryText
> = {
  competencies: {
    label: 'Kompetenzen',
    description:
      'Fachwissen in bestimmten Bereichen, Vorträge über bestimmte Themen, … Beispiele: Wissen, Studien, Datenzugänge, Dokumentationen',
  },
  financial_resources: {
    label: 'Finanzielle Mittel',
    description:
      'Beispiele: Verwaltung öffentlicher Gelder, Stipendien, Stiftungsgelder, …',
  },
  premises: {
    label: 'Räumlichkeiten',
    description: 'Beispiele: Gebäude, Innenräume, Büros, Hallen, …',
  },
  land: {
    label: 'Flächen',
    description:
      'Beispiele: Grundstücke, Pachtflächen, Außenareale, landwirtschaftliche Flächen, Parkflächen, Naturreservate, …',
  },
  equipment: {
    label: 'Geräte / physische Ausstattung',
    description: 'Beispiele: Maschinen, IT, Fahrzeuge, Tools, …',
  },
  networks: {
    label: 'Netzwerke / Beziehungen',
    description:
      'Beispiele: Kontakte, Partner, Zugänge zu Zielgruppen, Multiplikatoren',
  },
  helping_hands: {
    label: 'Helfende Hände',
    description:
      'Beispiele: menschliche Helfer, die bei Projekten unterstützen können/wollen, Arbeitszeit, ehrenamtliches Engagement',
  },
};
