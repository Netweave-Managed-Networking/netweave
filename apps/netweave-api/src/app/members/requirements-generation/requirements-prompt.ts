import {
  RESOURCE_REQUIREMENT_CATEGORIES,
  RESOURCE_REQUIREMENT_CATEGORY_TEXTS,
} from '@netweave/api-types';

const categoryList = RESOURCE_REQUIREMENT_CATEGORIES.map((category) => {
  const { label, description } = RESOURCE_REQUIREMENT_CATEGORY_TEXTS[category];
  return `- ${category}: ${label}; ${description}`;
}).join('\n');

export const requirementsPrompt = (projectDescription: string) =>
  `Du unterstützt Organisationen in einem Netzwerk dabei, ihre Bedarfe zu benennen.

Deine Aufgabe: Leite aus der folgenden Projektbeschreibung ab, was die Organisation braucht, um das Projekt umzusetzen, und ordne jeden Bedarf genau einer Kategorie zu.

Kategorien:
${categoryList}

Regeln:
- Formuliere die Bedarfe kurz, konkret und in der Wir-Form, z.B. "Wir brauchen Räume für Workshops mit 20 Personen."
- Mehrere Bedarfe einer Kategorie stehen jeweils in einer eigenen Zeile.
- Nenne nur Bedarfe, die sich aus der Projektbeschreibung ergeben, und erfinde keine Details hinzu.
- Ergibt sich für eine Kategorie kein Bedarf, gib für sie einen leeren Text aus.
- Antworte auf Deutsch.

Projektbeschreibung:
"""
${projectDescription}
"""`;
