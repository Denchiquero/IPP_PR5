const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');

const { connectToDatabase, closeDatabase, pingDatabase } = require('./src/config/database');
const createContactRouter = require('./src/routes/contact.routes');
const ContactRepository = require('./src/repositories/contact.repository');
const ContactService = require('./src/services/contact.service');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const OPENAPI_FILE = path.join(__dirname, 'openapi.yaml');
const REDOC_BUNDLE = require.resolve('redoc/bundles/redoc.standalone.js');

function createApp(database) {
  const app = express();
  const repository = new ContactRepository(database.collection('contacts'));
  const service = new ContactService(repository);
  const openapiDocument = YAML.parse(fs.readFileSync(OPENAPI_FILE, 'utf8'));

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(PUBLIC_DIR));

  app.get('/health', async (req, res) => {
    try {
      await pingDatabase();
      res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      res.status(503).json({ status: 'error', database: 'unavailable' });
    }
  });

  app.get('/openapi.yaml', (req, res) => res.sendFile(OPENAPI_FILE));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, {
    customSiteTitle: 'Contacts API — Swagger UI'
  }));
  app.get('/redoc-assets/redoc.standalone.js', (req, res) => res.sendFile(REDOC_BUNDLE));
  app.get('/redoc', (req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Contacts API — ReDoc</title>
    <style>body { margin: 0; padding: 0; }</style>
  </head>
  <body>
    <redoc spec-url="/openapi.yaml"></redoc>
    <script src="/redoc-assets/redoc.standalone.js"></script>
  </body>
</html>`);
  });

  app.use('/api/contacts', createContactRouter(service));

  app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
  });

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'Некорректный JSON' });
    }
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.status ? error.message : 'Внутренняя ошибка сервера'
    });
  });

  return app;
}

async function start() {
  const database = await connectToDatabase();
  const app = createApp(database);
  const server = app.listen(PORT, HOST, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/docs`);
    console.log(`ReDoc: http://localhost:${PORT}/redoc`);
  });

  async function shutdown(signal) {
    console.log(`\nПолучен ${signal}, завершаем работу...`);
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
  start().catch(error => {
    console.error('Не удалось запустить приложение:', error.message);
    process.exit(1);
  });
}

module.exports = { createApp, start };
