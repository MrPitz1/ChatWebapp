db = db.getSiblingDB('myDatabase');  // Ersetzen Sie 'myDatabase' durch den gewünschten Datenbanknamen

// Erstellen der Kollektion 'user_profiles' falls nicht vorhanden
if (!db.getCollectionNames().includes('user_profiles')) {
  db.createCollection('user_profiles');
}

// Optionale Validierung für die Felder 'name' und 'password' hinzufügen
db.runCommand({
  collMod: 'user_profiles',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Muss ein String sein und ist erforderlich'
        },
        password: {
          bsonType: 'string',
          description: 'Muss ein String sein und ist erforderlich'
        }
      }
    }
  }
});

// Einfügen eines Beispiel-Dokuments zur Verifizierung der Kollektionserstellung
db.user_profiles.insertOne({ name: 'sampleName', password: 'samplePassword' });
