import { CultureOrientation } from '@netweave/api-types';

/**
 * by the culture of the recipient, then by the culture of the recommended member;
 * G = Gemeinschaft, I = Innovation, W = Ziel & Wirkung, S = Struktur
 */
export const CULTURE_HINTS: Record<
  CultureOrientation,
  Record<CultureOrientation, string>
> = {
  G: {
    G: 'Ihre Organisationen legen beide viel Wert auf Beteiligung, Austausch und vertrauensvolle Zusammenarbeit. Das kann eine gute Grundlage für die Kooperation sein. Achten Sie dennoch darauf, Entscheidungen und Zuständigkeiten klar festzuhalten, damit Abstimmungen nicht unnötig lange dauern.',
    I: 'Ihre Organisation legt eher Wert auf Beteiligung und gemeinsam getragene Lösungen, während die andere Organisation stärker auf neue Ideen und flexible Vorgehensweisen setzt. Das kann sich gut ergänzen. Hilfreich ist, früh zu klären, wie viel Abstimmung nötig ist und wo Freiräume zum Ausprobieren bestehen.',
    W: 'Ihre Organisation legt eher Wert auf Beteiligung und vertrauensvolle Zusammenarbeit, während die andere Organisation stärker auf Ziele und konkrete Ergebnisse fokussiert. Das kann sich gut ergänzen, wenn gemeinsame Ziele klar vereinbart werden. Achten Sie darauf, dass ausreichend Raum für Abstimmung bleibt und zugleich Entscheidungen nicht unnötig verzögert werden.',
    S: 'Ihre Organisation legt eher Wert auf Beteiligung und gemeinsam getragene Lösungen, während die andere Organisation stärker auf klare Abläufe und Zuständigkeiten setzt. Diese Stärken können sich gut ergänzen. Hilfreich ist, Beteiligungsmöglichkeiten und Entscheidungswege von Beginn an eindeutig abzusprechen.',
  },
  I: {
    G: 'Ihre Organisation setzt eher auf neue Ideen, Flexibilität und Erprobung, während die andere Organisation stärker auf Beteiligung und vertrauensvolle Zusammenarbeit achtet. Das kann innovative Lösungen mit guter gemeinsamer Akzeptanz verbinden. Planen Sie jedoch genügend Austausch ein, bevor neue Ansätze umgesetzt werden.',
    I: 'Ihre Organisationen legen beide viel Wert auf neue Ideen, Flexibilität und das Ausprobieren unterschiedlicher Lösungswege. Das kann eine sehr kreative Zusammenarbeit ermöglichen. Achten Sie darauf, Ziele, Zuständigkeiten und nächste Schritte trotzdem ausreichend festzuhalten.',
    W: 'Ihre Organisation setzt eher auf neue Ideen und flexible Lösungen, während die andere Organisation stärker auf Zielerreichung und konkrete Wirkung fokussiert. Dadurch können kreative Ansätze schnell auf ihre praktische Wirkung ausgerichtet werden. Klären Sie früh, wie viel Raum für Erprobung besteht und wann verbindliche Ergebnisse erwartet werden.',
    S: 'Ihre Organisation arbeitet eher flexibel und experimentierfreudig, während die andere Organisation stärker auf klare Strukturen und verlässliche Abläufe setzt. Das kann sich gut ergänzen, wenn Innovation und Planung miteinander verbunden werden. Vereinbaren Sie möglichst früh, welche Bereiche flexibel bleiben können und wo feste Prozesse notwendig sind.',
  },
  W: {
    G: 'Ihre Organisation legt eher Wert auf Zielerreichung und konkrete Wirkung, während die andere Organisation stärker auf Beteiligung und vertrauensvolle Zusammenarbeit setzt. Das kann Ergebnisse mit einer breiten gemeinsamen Basis verbinden. Achten Sie darauf, dass der Wunsch nach schnellen Fortschritten genügend Raum für Abstimmung lässt.',
    I: 'Ihre Organisation fokussiert stärker auf Ziele und konkrete Ergebnisse, während die andere Organisation eher neue Ideen und flexible Lösungswege einbringt. Das kann besonders produktiv sein, wenn Innovation gezielt auf gemeinsame Ziele ausgerichtet wird. Hilfreich ist, vorab zu klären, wann experimentiert werden kann und wann Ergebnisse verbindlich werden müssen.',
    W: 'Ihre Organisationen richten ihre Arbeit beide stark an Zielen und konkreten Ergebnissen aus. Dadurch können Prioritäten und Erfolgskriterien schnell gemeinsam geklärt werden. Achten Sie darauf, neben der Zielerreichung auch genügend Zeit für Abstimmung und unterschiedliche Perspektiven einzuplanen.',
    S: 'Ihre Organisation legt eher Wert auf Zielerreichung und Wirkung, während die andere Organisation stärker auf klare Abläufe und Verlässlichkeit setzt. Das kann eine effiziente und gut organisierte Zusammenarbeit unterstützen. Klären Sie früh, wie viel Flexibilität bei der Umsetzung möglich ist und welche Prozesse verbindlich eingehalten werden sollen.',
  },
  S: {
    G: 'Ihre Organisation legt eher Wert auf klare Abläufe, Zuständigkeiten und Verlässlichkeit, während die andere Organisation stärker auf Beteiligung und gemeinsam getragene Lösungen setzt. Das kann strukturierte Prozesse mit guter Einbindung der Beteiligten verbinden. Achten Sie darauf, Regeln nicht zu früh festzulegen, bevor wichtige Perspektiven eingebunden wurden.',
    I: 'Ihre Organisation arbeitet eher mit klaren Strukturen und verlässlichen Abläufen, während die andere Organisation stärker auf Flexibilität und neue Lösungswege setzt. Diese Unterschiede können sich gut ergänzen. Hilfreich ist, feste Rahmenbedingungen zu vereinbaren und innerhalb dieser bewusst Spielraum für neue Ansätze zu lassen.',
    W: 'Ihre Organisation legt eher Wert auf klare Abläufe und verlässliche Prozesse, während die andere Organisation stärker auf Ziele und konkrete Ergebnisse fokussiert. Das kann eine sehr zielgerichtete und strukturierte Zusammenarbeit ermöglichen. Achten Sie darauf, Prozesse dort flexibel anzupassen, wo sie die gemeinsame Zielerreichung unnötig erschweren.',
    S: 'Ihre Organisationen legen beide viel Wert auf klare Zuständigkeiten, verlässliche Abläufe und planbares Vorgehen. Das kann die Zusammenarbeit besonders übersichtlich und verbindlich machen. Achten Sie darauf, dennoch genügend Flexibilität für unerwartete Situationen und neue Ideen zu bewahren.',
  },
};
