const { MongoClient } = require('mongodb');

let client;
let database;

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const databaseName = process.env.MONGODB_DB || 'contacts_app';

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  database = client.db(databaseName);
  await database.collection('contacts').createIndex({ email: 1 });
  console.log(`MongoDB подключена, база: ${databaseName}`);
  return database;
}

async function pingDatabase() {
  if (!database) throw new Error('Соединение с MongoDB не установлено');
  await database.command({ ping: 1 });
}

async function closeDatabase() {
  if (client) await client.close();
  client = undefined;
  database = undefined;
}

module.exports = { connectToDatabase, pingDatabase, closeDatabase };
