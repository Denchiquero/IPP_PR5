const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, 'contacts.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

function sendJson(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(text)
  });
  res.end(text);
}

function readContacts() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    console.error('Ошибка чтения contacts.json:', error.message);
    return [];
  }
}

function saveContacts(contacts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2), 'utf8');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Слишком большое тело запроса'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Некорректный JSON'));
      }
    });

    req.on('error', reject);
  });
}

function validateContact(data) {
  return Boolean(
    data &&
    typeof data.name === 'string' && data.name.trim() &&
    typeof data.email === 'string' && data.email.trim() &&
    typeof data.mobile === 'string' && data.mobile.trim()
  );
}

function serveIndex(res) {
  const file = path.join(PUBLIC_DIR, 'index.html');
  fs.readFile(file, 'utf8', (error, html) => {
    if (error) return sendText(res, 500, 'Не удалось открыть страницу');
    sendText(res, 200, html, 'text/html; charset=utf-8');
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Главная страница
  if (req.method === 'GET' && pathname === '/') {
    return serveIndex(res);
  }

  // Проверка работоспособности для облачного сервиса
  if (req.method === 'GET' && pathname === '/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  // GET /api/contacts — получить все контакты
  if (req.method === 'GET' && pathname === '/api/contacts') {
    return sendJson(res, 200, readContacts());
  }

  const match = pathname.match(/^\/api\/contacts\/(\d+)$/);

  // GET /api/contacts/:id — получить один контакт
  if (req.method === 'GET' && match) {
    const id = Number(match[1]);
    const contact = readContacts().find(item => item.id === id);
    if (!contact) return sendJson(res, 404, { error: 'Контакт не найден' });
    return sendJson(res, 200, contact);
  }

  // POST /api/contacts — создать контакт
  if (req.method === 'POST' && pathname === '/api/contacts') {
    try {
      const data = await readBody(req);
      if (!validateContact(data)) {
        return sendJson(res, 400, { error: 'Заполните имя, email и мобильный телефон' });
      }

      const contacts = readContacts();
      const newContact = {
        id: contacts.length ? Math.max(...contacts.map(item => item.id)) + 1 : 1,
        name: data.name.trim(),
        email: data.email.trim(),
        mobile: data.mobile.trim(),
        work: typeof data.work === 'string' ? data.work.trim() : ''
      };

      contacts.push(newContact);
      saveContacts(contacts);
      return sendJson(res, 201, newContact);
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  }

  // PUT /api/contacts/:id — полностью изменить контакт
  if (req.method === 'PUT' && match) {
    try {
      const id = Number(match[1]);
      const data = await readBody(req);
      if (!validateContact(data)) {
        return sendJson(res, 400, { error: 'Заполните имя, email и мобильный телефон' });
      }

      const contacts = readContacts();
      const index = contacts.findIndex(item => item.id === id);
      if (index === -1) return sendJson(res, 404, { error: 'Контакт не найден' });

      contacts[index] = {
        id,
        name: data.name.trim(),
        email: data.email.trim(),
        mobile: data.mobile.trim(),
        work: typeof data.work === 'string' ? data.work.trim() : ''
      };

      saveContacts(contacts);
      return sendJson(res, 200, contacts[index]);
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  }

  // DELETE /api/contacts/:id — удалить контакт
  if (req.method === 'DELETE' && match) {
    const id = Number(match[1]);
    const contacts = readContacts();
    const index = contacts.findIndex(item => item.id === id);
    if (index === -1) return sendJson(res, 404, { error: 'Контакт не найден' });

    const [deleted] = contacts.splice(index, 1);
    saveContacts(contacts);
    return sendJson(res, 200, deleted);
  }

  return sendJson(res, 404, { error: 'Маршрут не найден' });
});

server.listen(PORT, HOST, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
