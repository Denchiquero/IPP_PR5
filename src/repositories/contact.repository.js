const { ObjectId } = require('mongodb');

function toContact(document) {
  if (!document) return null;
  return {
    id: document._id.toString(),
    name: document.name,
    email: document.email,
    mobile: document.mobile,
    work: document.work || ''
  };
}

class ContactRepository {
  constructor(collection) {
    this.collection = collection;
  }

  async findAll() {
    const documents = await this.collection.find().sort({ name: 1 }).toArray();
    return documents.map(toContact);
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return toContact(await this.collection.findOne({ _id: new ObjectId(id) }));
  }

  async create(contact) {
    const result = await this.collection.insertOne(contact);
    return toContact({ _id: result.insertedId, ...contact });
  }

  async update(id, contact) {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.collection.findOneAndReplace(
      { _id: new ObjectId(id) },
      contact,
      { returnDocument: 'after' }
    );
    return toContact(result);
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;
    return toContact(await this.collection.findOneAndDelete({ _id: new ObjectId(id) }));
  }
}

module.exports = ContactRepository;
