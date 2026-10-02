const fs = require('fs');
const path = require('path');
const { connectToDatabase, closeDatabase } = require('../src/config/database');

async function seed() {
  const file = path.join(__dirname, '..', 'contacts.json');
  const contacts = JSON.parse(fs.readFileSync(file, 'utf8'));
  const database = await connectToDatabase();
  const collection = database.collection('contacts');

  for (const contact of contacts) {
    const { id, ...data } = contact;
    await collection.updateOne(
      { email: data.email },
      { $set: data },
      { upsert: true }
    );
  }

  console.log(`Добавлено или обновлено контактов: ${contacts.length}`);
  await closeDatabase();
}

seed().catch(async error => {
  console.error('Ошибка заполнения MongoDB:', error.message);
  await closeDatabase();
  process.exit(1);
});
