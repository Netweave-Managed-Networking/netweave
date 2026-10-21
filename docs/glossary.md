# Glossar – Netweave

## A

### Admin

**Nutzerrolle im [Netweave-System](#netweave)**. Weitere Rollen sind: [Editor](#editor)

**Berechtigungen:**

- alle Berechtigungen des [Editors](#editor)
- Verwaltung von [Zugangslinks](#zugangslink): erstellen, auslesen & kopieren, löschen

Entspricht fachlich dem [Netzwerkberater](#netzwerkberater), welcher entweder [Editor](#editor) oder Admin ist.

---

## B

### Bedarf

_Synonyme:_ **Ressourcenbedarf**

[Ressource](#ressource), die von einem [Netzwerkteilnehmer](#netzwerkteilnehmer) benötigt wird.

Eigenschaften:

- immer einer [Ressourcenkategorie](#ressourcenkategorie) zugeordnet
- Wichtiger Baustein für den [Matching-Score](#matching-score)
- Gegenstück zur [Ressource](#ressource)

---

## E

### Editor

**Nutzerrolle im [Netweave-System](#netweave)**. Weitere Rollen sind: [Admin](#admin)

**Berechtigungen:**

- [Netzwerkteilnehmer](#netzwerkteilnehmer) anlegen
- [Fragebogen](#fragebogen)-Links versenden lassen
- [Matching](#matching) ausführen und Ergebnisse einsehen
- [Empfehlungen](#empfehlung) begleiten

Entspricht fachlich dem [Netzwerkberater](#netzwerkberater), welcher entweder Editor oder [Admin](#admin) ist.

---

### Empfehlung

_Synonyme:_ **Vernetzungsempfehlung**, **Kooperationsempfehlung**

Auf Basis des [Matching-Algorithmus](#matching) automatisch erzeugte Mitteilung an einen [Netzwerkteilnehmer](#netzwerkteilnehmer)  
über passende Kooperationspartner.

Typischer Inhalt:

- Top-3 Matches
- Hinweise zu [Ressourcen](#ressource) und [Bedarfen](#bedarf)
- Hinweise zur [Organisationskultur](#organisationskultur)

---

## F

### Fragebogen

Zentrales Instrument zur Datenerhebung bei [Netzwerkteilnehmern](#netzwerkteilnehmer).  
Zugriff über Link, ohne Login.

**Enthält:**

1. Stammdaten
2. Ressourcen – Freitext pro [Ressourcenkategorie](#ressourcenkategorie)
3. Bedarfe – Freitext pro [Ressourcenkategorie](#ressourcenkategorie)
4. Fragen zur Ermittlung der [Organisationskultur](#organisationskultur)

Alle Angaben bilden die Grundlage für den [Matching-Score](#matching-score).

---

## M

### Matching

_Synonyme:_ **Matching-Algorithmus**

Automatischer Abgleich von [Ressourcen](#ressource) und [Bedarfen](#bedarf)  
zwischen [Netzwerkteilnehmern](#netzwerkteilnehmer) zur Ermittlung einer "Passung" einer [Ressource](#ressource) zu einem [Bedarf](#bedarf).

Für jeden [Bedarf](#bedarf) werden die passendesten [Ressourcen](#ressource) ermittelt.

Ergebnis: potenzielle Kooperationspartner (andere [Netzwerkteilnehmer](#netzwerkteilnehmer)), die über diese [Ressourcen](#ressource) verfügen

---

### Matching-Score

_Synonyme:_ **Matching-Algorithmus**

Numerische Bewertung der Passung zwischen zwei [Netzwerkteilnehmern](#netzwerkteilnehmer) (z. B. 0–100 %).

Berechnungsgrundlage:

- Übereinstimmung von [Ressourcen](#ressource) und [Bedarfen](#bedarf)
- Vergleich der [Organisationskultur](#organisationskultur)

---

## N

### Netweave

bezeichnet A) Das **Netweave-Projekt** oder B) das **Netweave-System**.

_In diesem EIntrag wird das Netweave-System beschrieben._

Softwareplattform zur automatisierten ressourcen- und bedarfsorientierten  
Vernetzung von [Netzwerkteilnehmern](#netzwerkteilnehmer).

Kernfunktionen:

- [Fragebogen](#fragebogen)-gestützte Datenerhebung
- [Matching](#matching)
- Versand von [Vernetzungsempfehlungen](#empfehlung)

---

### Netzwerkberater

Fachliche Rolle.  
Person, die ein Netzwerk betreibt und das [Netweave-System](#netweave) nutzt, um [Vernetzungsempfehlungen](#empfehlung) an [Teilnehmer](#netzwerkteilnehmer) auszusprechen.

Im [Netweave-System](#netweave) wird der Netzwerkberater technisch abgebildet als [Editor](#editor) oder [Admin](#admin)

---

### Netzwerkteilnehmer

Fachliche Rolle.  
_Synonyme:_ **Organisation**, Stakeholder (veralteter Begriff)

**Organisation** oder in Ausnahmen **Einzelperson**, die am Netzwerk teilnimmt.

Netzwerkteilnehmer beantworten und aktualisieren den [Fragebogen](#fragebogen), stellen [Ressourcen](#ressource) bereit, formulieren [Bedarfe](#bedarf) und erhalten [Vernetzungsempfehlungen](#empfehlung)

Im [Netweave-System](#netweave) wird der Netzwerkteilnehmer als Organisation abgebildet.

- Netzwerteilnehmern kommt keine Rolle wie [Editor](#editor) oder [Admin](#admin) zu.
- Netzwerkteilnehmer haben keinen Zugriff auf den Rest des Netzwerks, lediglich auf die Antworten des eigenen [Fragebogens](#fragebogen): Stammdaten, [Ressourcen](#ressource) und [Bedarfe](#bedarf).
- Die Beantwortung des [Fragebogens](#fragebogen) erfolgt ohne Login
- Der Beantwortungzugriff auf den eigenen [Fragebogen](#fragebogen) erfolgt über einen geheimen Link

---

## O

### Organisationskultur

Strukturiert erhobene Merkmale der Arbeits- und Entscheidungslogik  
einer [Netzwerkteilnehmer](#netzwerkteilnehmer)-Organisation.

Fließt als weicher Faktor in den [Matching-Score](#matching-score) ein.

---

## R

### Ressource

Fähigkeit, Mittel oder Angebot eines [Netzwerkteilnehmers](#netzwerkteilnehmer).\
Soll anderen [Netzwerkteilnehmern](#netzwerkteilnehmer) zur Verfügung gestellt werden.

Eigenschaften:

- immer einer [Ressourcenkategorie](#ressourcenkategorie) zugeordnet
- Wichtiger Baustein für den [Matching-Score](#matching-score)
- Gegenstück zum [Bedarf](#bedarf)

---

### Ressourcenkategorie

_Synonyme:_ **Bedarfskategorie**

Vordefinierte feste Kategorien zur Strukturierung von  
[Ressourcen](#ressource) und [Bedarfen](#bedarf).

Sechs festgelegte Kategorien:

- Human Ressources
- Finanzielle Mittel
- Räumlichkeiten
- Flächen
- Geräte
- Kompetenzen.

Nicht durch [Netzwerkberater](#netzwerkberater) veränderbar.\
Nicht durch [Netzwerkteilnehmer](#netzwerkteilnehmer) veränderbar.

---

## Z

### Zugangslink

Link, der zur Registrierung eines neuen [Netzwerkberater](#netzwerkberater)-Profils notwendig ist.

Wird durch den [Admin](#admin) verwaltet, beispielhafter Ablauf:

1. Admin erstellt Zugangslink
1. Admin versendet Zugangslink
1. neuer Netzwerkberater klickt auf Zugangslink
1. neuer Netzwerkberater füllt Registrierung aus (Name, Mail, Passwort)
1. neuer Netzwerkberater ist nun [Editor](#editor) und kann [Netweave-System](#netweave) nutzen

---

## Rollenübersicht

| Rolle                                     | Beschreibung                                                   |
| ----------------------------------------- | -------------------------------------------------------------- |
| [Admin](#admin)                           | Systemrolle mit erweiterten Rechten inkl. Zuganslinkverwaltung |
| [Editor](#editor)                         | Operative Systemrolle für Netzwerkarbeit                       |
| [Netzwerkberater](#netzwerkberater)       | Fachliche Bezeichnung für Admin / Editor                       |
| [Netzwerkteilnehmer](#netzwerkteilnehmer) | Organisation im Netzwerk                                       |
| Organisation                              | entspricht Netzwerkteilnehmer                                  |
