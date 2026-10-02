# Практические работы №5–6 — Contacts API

Учебное fullstack-приложение для управления телефонными контактами. Проект соответствует заданиям из методички:

- практическая №5: Node.js, Express, MongoDB, REST и полный CRUD;
- практическая №6: спецификация OpenAPI 3.0 в YAML, Swagger UI, ReDoc и mock-сервер Prism.

## Возможности

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| `GET` | `/api/contacts` | Получить все контакты |
| `GET` | `/api/contacts/{id}` | Получить один контакт |
| `POST` | `/api/contacts` | Создать контакт |
| `PUT` | `/api/contacts/{id}` | Обновить контакт |
| `DELETE` | `/api/contacts/{id}` | Удалить контакт |
| `GET` | `/health` | Проверить приложение и MongoDB |

Архитектура сервера разделена на маршруты, сервис с бизнес-логикой и репозиторий доступа к MongoDB.

## Локальный запуск

Требуются Node.js 18+ и MongoDB. Установить зависимости:

```bash
npm install
```

Задать переменные окружения в терминале (их список есть в `.env.example`):

```bash
export MONGODB_URI='mongodb://127.0.0.1:27017'
export MONGODB_DB='contacts_app'
npm start
```

Чтобы один раз перенести демонстрационные записи из `contacts.json` в MongoDB, перед запуском выполните:

```bash
npm run seed
```

После запуска доступны:

- приложение: <http://localhost:3000>;
- Swagger UI: <http://localhost:3000/docs>;
- ReDoc: <http://localhost:3000/redoc>;
- исходная спецификация: <http://localhost:3000/openapi.yaml>.

Начальные контакты можно добавить через веб-интерфейс, Swagger UI или `curl`:

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H 'Content-Type: application/json' \
  -d '{"name":"Анна Смирнова","email":"anna@example.com","mobile":"+7 900 333-33-33","work":"+7 495 333-33-33"}'
```

MongoDB создаст строковый `id` формата ObjectId. Используйте его в запросах `GET`, `PUT` и `DELETE`.

## Mock API для практической №6

Prism читает тот же контракт `openapi.yaml` и запускает имитационный сервер:

```bash
npm run mock
```

По умолчанию mock API будет доступен на <http://127.0.0.1:4010>. Например:

```bash
curl http://127.0.0.1:4010/api/contacts
```

## Развёртывание в Render и MongoDB Atlas

1. Создать кластер MongoDB Atlas, пользователя БД и разрешить сетевой доступ.
2. Скопировать строку подключения вида `mongodb+srv://USER:PASSWORD@CLUSTER/contacts_app`.
3. Загрузить проект в GitHub и создать в Render сервис из `render.yaml`.
4. В настройках Render задать секрет `MONGODB_URI` и при необходимости `MONGODB_DB`.
5. После деплоя проверить `/health`, `/docs`, `/redoc` и CRUD через главную страницу.

Не добавляйте реальную строку подключения в репозиторий: `.env` исключён через `.gitignore`.
