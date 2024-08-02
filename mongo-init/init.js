db = db.getSiblingDB('myDatabase');  // Replace 'myDatabase' with your desired database name

// Create the 'user_profiles' collection if it does not exist
if (!db.getCollectionNames().includes('user_profiles')) {
  db.createCollection('user_profiles');
}

// Optional validation for the 'username' and 'password' fields
db.runCommand({
  collMod: 'user_profiles',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Must be a string and is required'
        },
        password: {
          bsonType: 'string',
          description: 'Must be a string and is required'
        }
      }
    }
  }
});

// Insert a sample document to verify the collection creation
db.user_profiles.insertOne({ username: 'sampleUsername', password: 'samplePassword' });
