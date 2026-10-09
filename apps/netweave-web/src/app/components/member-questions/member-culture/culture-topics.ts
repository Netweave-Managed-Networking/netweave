import { CultureOrientation, CultureTopic } from '@netweave/api-types';

interface CultureTopicText {
  label: string;
  statements: Record<CultureOrientation, string>;
}

/** display texts per topic and orientation; the Record types ensure no statement is missing */
export const CULTURE_TOPIC_TEXTS: Record<CultureTopic, CultureTopicText> = {
  Z1: {
    label: 'Zusammenarbeit und Entscheidungen',
    statements: {
      G: 'Entscheidungen sollten unter Beteiligung der Betroffenen entstehen und von einer tragfähigen gemeinsamen Lösung getragen werden.',
      I: 'Beteiligte sollten Freiräume haben, neue Vorgehensweisen eigenständig zu entwickeln und auszuprobieren.',
      W: 'Entscheidungen sollten konsequent danach getroffen werden, welche Option die vereinbarten Ziele am wirksamsten voranbringt.',
      S: 'Entscheidungen sollten anhand klarer Zuständigkeiten und nachvollziehbarer Verfahren getroffen werden.',
    },
  },
  Z2: {
    label: 'Umgang mit Veränderungen und Unsicherheit',
    statements: {
      G: 'Unterschiedliche Sichtweisen sollten offen besprochen und möglichst in eine gemeinsam getragene Lösung überführt werden.',
      I: 'Neue Situationen sollten als Anlass dienen, ungewöhnliche Lösungswege zu testen und das Vorgehen flexibel anzupassen.',
      W: 'Bei Veränderungen sollte die Organisation rasch priorisieren und sich auf die wirksamsten Handlungsoptionen konzentrieren.',
      S: 'Veränderungen sollten systematisch geprüft und anschließend in verlässliche Planungen und Abläufe übersetzt werden.',
    },
  },
  Z3: {
    label: 'Einsatz von Zeit und Ressourcen',
    statements: {
      G: 'Zeit und Aufmerksamkeit sollten besonders in Austausch, gegenseitige Unterstützung und belastbare Beziehungen investiert werden.',
      I: 'Ressourcen sollten Freiräume für Erprobung, Lernen und die Entwicklung neuer Ansätze schaffen.',
      W: 'Ressourcen sollten auf die Maßnahmen konzentriert werden, die den größten Beitrag zu den vereinbarten Zielen erwarten lassen.',
      S: 'Ressourcen sollten eine verlässliche Aufgabenverteilung, planbare Abläufe und definierte Qualitätsstandards ermöglichen.',
    },
  },
  Z4: {
    label: 'Gelungene organisationsübergreifende Kooperation',
    statements: {
      G: 'Eine Kooperation ist erfolgreich, wenn Vertrauen wächst und sich die Beteiligten gemeinsam verantwortlich fühlen.',
      I: 'Eine Kooperation ist erfolgreich, wenn neue Lösungen entstehen und die Beteiligten übertragbare Erkenntnisse gewinnen.',
      W: 'Eine Kooperation ist erfolgreich, wenn vereinbarte Ziele erreicht werden und die angestrebte Wirkung erkennbar ist.',
      S: 'Eine Kooperation ist erfolgreich, wenn Zuständigkeiten, Termine und Qualitätsanforderungen zuverlässig eingehalten werden.',
    },
  },
};
