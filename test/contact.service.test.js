const test = require('node:test');
const assert = require('node:assert/strict');
const ContactService = require('../src/services/contact.service');

class MemoryRepository {
  constructor() {
    this.contacts = new Map();
    this.nextId = 1;
  }

  async findAll() {
    return [...this.contacts.values()];
  }

  async findById(id) {
    return this.contacts.get(id) || null;
  }

  async create(contact) {
    const saved = { id: String(this.nextId++), ...contact };
    this.contacts.set(saved.id, saved);
    return saved;
  }

  async update(id, contact) {
    if (!this.contacts.has(id)) return null;
    const saved = { id, ...contact };
    this.contacts.set(id, saved);
    return saved;
  }

  async delete(id) {
    const contact = this.contacts.get(id) || null;
    this.contacts.delete(id);
    return contact;
  }
}

test('ContactService выполняет полный CRUD', async () => {
  const service = new ContactService(new MemoryRepository());

  const created = await service.create({
    name: '  Анна Смирнова  ',
    email: ' anna@example.com ',
    mobile: ' +7 900 333-33-33 ',
    work: ''
  });
  assert.equal(created.id, '1');
  assert.equal(created.name, 'Анна Смирнова');
  assert.deepEqual(await service.list(), [created]);
  assert.deepEqual(await service.get(created.id), created);

  const updated = await service.update(created.id, {
    name: 'Анна Петрова',
    email: 'petrova@example.com',
    mobile: '+7 900 444-44-44'
  });
  assert.equal(updated.email, 'petrova@example.com');
  assert.equal(updated.work, '');

  assert.deepEqual(await service.delete(created.id), updated);
  assert.deepEqual(await service.list(), []);
});

test('ContactService отклоняет данные без обязательных полей', () => {
  const service = new ContactService(new MemoryRepository());

  assert.throws(
    () => service.create({ name: 'Иван', mobile: '+7 900 000-00-00' }),
    error => error.status === 400 && error.message.includes('email')
  );
});

test('ContactService возвращает 404 для неизвестного контакта', async () => {
  const service = new ContactService(new MemoryRepository());

  await assert.rejects(
    () => service.get('missing'),
    error => error.status === 404 && error.message === 'Контакт не найден'
  );
});
