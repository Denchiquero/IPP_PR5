function normalizeContact(data) {
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    mobile: data.mobile.trim(),
    work: typeof data.work === 'string' ? data.work.trim() : ''
  };
}

function validateContact(data) {
  const requiredFields = ['name', 'email', 'mobile'];
  const missing = requiredFields.filter(field => (
    typeof data?.[field] !== 'string' || !data[field].trim()
  ));

  if (missing.length > 0) {
    const error = new Error(`Заполните обязательные поля: ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }
}

class ContactService {
  constructor(repository) {
    this.repository = repository;
  }

  list() {
    return this.repository.findAll();
  }

  async get(id) {
    const contact = await this.repository.findById(id);
    if (!contact) this.notFound();
    return contact;
  }

  create(data) {
    validateContact(data);
    return this.repository.create(normalizeContact(data));
  }

  async update(id, data) {
    validateContact(data);
    const contact = await this.repository.update(id, normalizeContact(data));
    if (!contact) this.notFound();
    return contact;
  }

  async delete(id) {
    const contact = await this.repository.delete(id);
    if (!contact) this.notFound();
    return contact;
  }

  notFound() {
    const error = new Error('Контакт не найден');
    error.status = 404;
    throw error;
  }
}

module.exports = ContactService;
