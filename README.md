# Практическая работа №5 — REST API CRUD на Node.js

Приложение управляет списком телефонных контактов и реализует четыре CRUD-операции:

- Create — `POST /api/contacts`
- Read — `GET /api/contacts` и `GET /api/contacts/:id`
- Update — `PUT /api/contacts/:id`
- Delete — `DELETE /api/contacts/:id`

Проект специально сделан максимально простым: используется только встроенный Node.js, поэтому сторонние npm-пакеты не требуются.

## Локальный запуск

Перейти в папку проекта и выполнить:

```bash
npm run dev
```

или:

```bash
npm start
```

Открыть:

```text
http://localhost:3000
```

Проверка API:

```bash
curl http://localhost:3000/api/contacts
```

Добавление:

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Анна Смирнова","email":"anna@example.com","mobile":"+7 900 333-33-33","work":"+7 495 333-33-33"}'
```

Изменение контакта с id=1:

```bash
curl -X PUT http://localhost:3000/api/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Иван Иванов","email":"ivan.new@example.com","mobile":"+7 900 999-99-99","work":"+7 495 111-11-11"}'
```

Удаление контакта с id=2:

```bash
curl -X DELETE http://localhost:3000/api/contacts/2
```

## Развёртывание в облаке Render

1. Создать новый репозиторий на GitHub и загрузить туда содержимое этой папки.
2. В Render выбрать **New → Web Service**.
3. Подключить GitHub-репозиторий.
4. Указать:
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Нажать **Create Web Service**.
6. После развёртывания Render выдаст публичный адрес вида `https://имя-приложения.onrender.com`.
7. Проверить главную страницу и API: `https://имя-приложения.onrender.com/api/contacts`.

Файл `render.yaml` уже находится в проекте и содержит основные настройки сервиса.

## Важно о хранении данных в облаке

В этой учебной версии контакты хранятся в `contacts.json`. Локально изменения сохраняются между запусками. На облачном сервисе с эфемерной файловой системой изменения могут сброситься после перезапуска или нового деплоя. На выполнение CRUD во время работы приложения это не влияет.

Если преподавателю обязательно нужна постоянная облачная база данных, вместо `contacts.json` можно подключить MongoDB Atlas или PostgreSQL, но для демонстрации REST CRUD и развёртывания это не требуется самим заданием.
