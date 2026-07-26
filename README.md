# OpKit

**OpKit** — fullstack Mini CRM для управления задачами в реальном времени.

Приложение решает задачу централизованного ведения задач одного пользователя: создание и редактирование, изменение статусов на Kanban-доске, поиск, фильтрация и сортировка, а также синхронизация изменений между вкладками и устройствами без перезагрузки страницы через Socket.IO. Данные полностью изолированы — каждый пользователь видит только свои задачи.

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)

---

## Демо

> Проект развёрнут и доступен для тестирования.

- [Открыть приложение](https://opkit.vercel.app)
- [Открыть Swagger API](https://opkit-production.up.railway.app/api/docs)
- [Backend API](https://opkit-production.up.railway.app)

При первом обращении после простоя backend на Railway может отвечать с небольшой задержкой, пока сервис поднимается из спящего состояния.

Готового тестового аккаунта нет — зарегистрируйте нового пользователя прямо в приложении.

---

## Возможности

Ниже перечислены только те функции, которые реально реализованы в коде.

### Аутентификация и пользователи
- Регистрация нового пользователя (`POST /api/auth/register`)
- Вход по email и паролю (`POST /api/auth/login`)
- JWT access token, пароли хранятся в виде bcrypt-хэша
- Просмотр профиля текущего пользователя (`GET /api/auth/me`)
- Защищённые маршруты на клиенте (`/tasks`, `/profile`) и guest-маршруты (`/login`, `/register`)
- Изоляция данных: каждый пользователь работает только со своими задачами

### Задачи
- Создание, редактирование и удаление задач
- Изменение статуса: `TODO`, `IN_PROGRESS`, `DONE`
- Приоритеты: `LOW`, `MEDIUM`, `HIGH`
- Kanban-доска с тремя колонками по статусам
- Drag-and-drop карточек между колонками (`@dnd-kit`)
- Optimistic updates при смене статуса с откатом при ошибке
- Поиск по названию и описанию (case-insensitive)
- Фильтрация по статусу и приоритету
- Сортировка по дате создания/обновления, названию, приоритету и статусу
- Пагинация серверной выдачи

### Real-time
- Обновления через Socket.IO с авторизацией соединения по JWT
- События отправляются в персональную комнату пользователя (`user:{userId}`)
- События: `task.created`, `task.updated`, `task.status.changed`, `task.deleted`
- События эмитятся только после успешной записи в базу данных
- Redis-adapter для Socket.IO с graceful degradation до in-memory при недоступности Redis

### Интерфейс
- Состояния Loading / Empty / Error / Success на экранах
- Loading-состояния у кнопок и действий
- Toast-уведомления об операциях
- Анимации Kanban-доски (Framer Motion)
- Адаптивная вёрстка (Tailwind CSS)
- Формы на React Hook Form + Zod

### Инфраструктура и качество
- REST API с глобальной валидацией DTO (`class-validator` / `class-transformer`)
- Документация API через Swagger (`/api/docs`)
- Health check зависимостей (`GET /api/health`)
- PostgreSQL + Redis в Docker Compose
- Проверка переменных окружения при старте backend
- Unit-тесты (Jest) и e2e-тесты на backend, unit-тесты (Vitest) на frontend

---

## Технологический стек

### Backend
NestJS · TypeScript · Prisma · PostgreSQL · Redis · Socket.IO · JWT · Passport · class-validator · class-transformer · Swagger

### Frontend
React 19 · TypeScript · Vite · React Router · TanStack Query · Axios · React Hook Form · Zod · Tailwind CSS · Framer Motion · `@dnd-kit` · Socket.IO Client

Frontend построен по архитектуре **Feature-Sliced Design**, backend — по модульной архитектуре NestJS (controller / service / dto / entities / mapper).

---

## Архитектура

```
opkit/
├── backend/            NestJS API (REST + WebSocket)
│   ├── src/
│   │   ├── auth/       регистрация, вход, JWT, guard, стратегия
│   │   ├── tasks/      CRUD задач, фильтры, пагинация
│   │   ├── users/      доступ к пользователям
│   │   ├── events/     Socket.IO gateway и Redis-adapter
│   │   ├── redis/      подключение к Redis
│   │   ├── prisma/     Prisma-сервис
│   │   ├── health/     health check
│   │   └── config/     валидация переменных окружения
│   └── prisma/         схема и миграции
├── frontend/           React SPA (Feature-Sliced Design)
│   └── src/
│       ├── app/        роутинг, провайдеры, guards, layout
│       ├── pages/      страницы
│       ├── widgets/    крупные блоки (Kanban-доска, панели)
│       ├── features/   действия (login, create-task, change-task-status, ...)
│       ├── entities/   бизнес-сущности (task, user)
│       └── shared/     UI-kit, API-клиент, socket, утилиты
├── docker-compose.yml  PostgreSQL + Redis
└── AGENTS.md           правила разработки
```

---

## API

Базовый префикс — `/api`. Все маршруты задач требуют заголовок `Authorization: Bearer <token>`.

| Метод    | Маршрут               | Описание                                   | Авторизация |
| -------- | --------------------- | ------------------------------------------ | ----------- |
| `POST`   | `/api/auth/register`  | Регистрация пользователя                   | —           |
| `POST`   | `/api/auth/login`     | Вход, возвращает access token              | —           |
| `GET`    | `/api/auth/me`        | Текущий пользователь                        | JWT         |
| `POST`   | `/api/tasks`          | Создать задачу                              | JWT         |
| `GET`    | `/api/tasks`          | Список задач (фильтры, поиск, сортировка, пагинация) | JWT |
| `GET`    | `/api/tasks/:id`      | Получить задачу по id                        | JWT         |
| `PATCH`  | `/api/tasks/:id`      | Обновить задачу                              | JWT         |
| `DELETE` | `/api/tasks/:id`      | Удалить задачу                               | JWT         |
| `GET`    | `/api/health`         | Состояние приложения и зависимостей          | —           |

Query-параметры `GET /api/tasks`: `page`, `limit` (1–100), `status`, `priority`, `search` (до 100 символов), `sortBy` (`createdAt` \| `updatedAt` \| `title` \| `priority` \| `status`), `sortOrder` (`asc` \| `desc`).

Полное описание схем и примеры доступны в Swagger: `/api/docs`.

---

## WebSocket-события

Клиент подключается к Socket.IO, передавая JWT в handshake. Неавторизованные соединения отклоняются. Сервер отправляет события только владельцу задач в комнату `user:{userId}`:

| Событие               | Когда отправляется              | Payload                       |
| --------------------- | ------------------------------- | ----------------------------- |
| `task.created`        | после создания задачи            | объект задачи                  |
| `task.updated`        | после обновления задачи          | объект задачи                  |
| `task.status.changed` | при изменении статуса задачи     | `{ id, status, timestamp }`    |
| `task.deleted`        | после удаления задачи            | `{ id, timestamp }`            |

---

## Требования

- Node.js 22+
- pnpm 11+
- Docker Desktop

---

## Локальный запуск

### 1. Инфраструктура

```bash
docker compose up -d
```

Поднимает PostgreSQL на порту `5433` (внешний, чтобы не конфликтовать с локальной установкой на `5432`) и Redis на `6379`.

Проверить состояние контейнеров:

```bash
docker compose ps
```

### 2. Backend

```bash
cd backend
pnpm install
cp .env.example .env
pnpm prisma migrate dev
pnpm prisma generate
pnpm run start:dev
```

API — `http://localhost:3000/api`, Swagger — `http://localhost:3000/api/docs`.

### 3. Frontend

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm run dev
```

Приложение — `http://localhost:5173`.

---

## Переменные окружения

### Backend (`backend/.env`)

Все переменные обязательны и проверяются при старте приложения.

| Переменная     | Описание                                  |
| -------------- | ----------------------------------------- |
| `DATABASE_URL` | строка подключения к PostgreSQL           |
| `JWT_SECRET`   | секрет для подписи JWT access token       |
| `REDIS_URL`    | строка подключения к Redis                |
| `PORT`         | порт HTTP-сервера                         |
| `FRONTEND_URL` | origin фронтенда, используется для CORS   |

Учётные данные в `DATABASE_URL` должны совпадать с `POSTGRES_*` из `docker-compose.yml`.

### Frontend (`frontend/.env`)

| Переменная        | Описание                        |
| ----------------- | ------------------------------- |
| `VITE_API_URL`    | базовый URL REST API            |
| `VITE_SOCKET_URL` | URL Socket.IO-сервера           |

---

## Тесты

### Backend

```bash
cd backend
pnpm run test       # unit-тесты (Jest)
pnpm run test:e2e   # e2e-тесты
```

### Frontend

```bash
cd frontend
pnpm run test       # unit-тесты (Vitest)
```

---

## Полезные команды

### Backend

| Команда                   | Описание                     |
| ------------------------- | ---------------------------- |
| `pnpm run start:dev`      | запуск в watch-режиме        |
| `pnpm run build`          | production-сборка            |
| `pnpm run start:prod`     | запуск собранного приложения |
| `pnpm run lint`           | ESLint с автоисправлением    |
| `pnpm prisma migrate dev` | создать и применить миграцию |
| `pnpm prisma generate`    | сгенерировать Prisma Client  |
| `pnpm prisma studio`      | просмотр данных в браузере   |

### Frontend

| Команда            | Описание            |
| ------------------ | ------------------- |
| `pnpm run dev`     | dev-сервер Vite     |
| `pnpm run build`   | production-сборка   |
| `pnpm run lint`    | ESLint              |
| `pnpm run preview` | предпросмотр сборки |

---

## Health check

```bash
curl http://localhost:3000/api/health
```

Возвращает `200`, если доступны PostgreSQL и Redis, иначе `503`. Тело ответа содержит статус каждой зависимости, uptime и timestamp.

---

## Разработка

Правила архитектуры, стиля кода и работы с Git описаны в [AGENTS.md](./AGENTS.md).
