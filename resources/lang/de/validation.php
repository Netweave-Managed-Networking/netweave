<?php

return [
    'accepted' => 'Das Feld ":attribute" muss akzeptiert werden.',
    'active_url' => 'Das Feld ":attribute" ist keine gültige URL.',
    'after' => 'Das Feld ":attribute" muss ein Datum nach dem :date sein.',
    'alpha' => 'Das Feld ":attribute" darf nur Buchstaben enthalten.',
    'array' => 'Das Feld ":attribute" muss ein Array sein.',
    'before' => 'Das Feld ":attribute" muss ein Datum vor dem :date sein.',
    'between' => [
        'numeric' => 'Das Feld ":attribute" muss zwischen :min und :max liegen.',
        'file' => 'Das Feld ":attribute" muss zwischen :min und :max Kilobytes liegen.',
        'string' => 'Das Feld ":attribute" muss zwischen :min und :max Zeichen lang sein.',
        'array' => 'Das Feld ":attribute" muss zwischen :min und :max Elemente enthalten.',
    ],
    'boolean' => 'Das Feld ":attribute" muss wahr oder falsch sein.',
    'confirmed' => 'Die Bestätigung für ":attribute" stimmt nicht überein.',
    'date' => 'Das Feld ":attribute" ist kein gültiges Datum.',
    'email' => 'Das Feld ":attribute" muss eine gültige E-Mail-Adresse sein.',
    'exists' => 'Das ausgewählte ":attribute" ist ungültig.',
    'required' => 'Das Feld ":attribute" ist erforderlich.',
    'unique' => 'Das Feld ":attribute" muss einzigartig sein. Der angegebene Wert wird aber bereits verwendet. Bitte wähle etwas anderes.',
    'max_bytes' => 'Das Feld ":attribute" darf nicht größer als :max Bytes sein.',
    // Add more custom translations as needed

    // Custom attribute names
    'attributes' => [
        'name' => 'Name',
        'description' => 'Beschreibung',
        'organization_categories' => 'Organisationskategorien',
        'organization_categories.*' => 'Organisationskategorie',
        'resource_categories' => 'Ressourcenkategorien',
        'resource_categories.*' => 'Ressourcenkategorie',
        // Add more mappings here
    ],
];
