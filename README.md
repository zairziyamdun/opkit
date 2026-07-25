# Opkit

CRM: пользователи, задачи, JWT-авторизация и работа в реальном времени через WebSocket.

## Стек

**Backend:** NestJS, TypeScript, Prisma, PostgreSQL, Redis, Socket.IO, JWT, Passport
**Frontend:** React, TypeScript, Vite, React Router, TanStack Query, Axios, React Hook Form, Zod, Tailwind CSS

## Структура

```
opkit/
├── backend/            NestJS API
├── frontend/           React SPA
├── docker-compose.yml  PostgreSQL + Redis
└── AGENTS.md           правила разработки
```

## Требования

- Node.js 22+
- pnpm 11+
- Docker Desktop

## Запуск

### 1. Инфраструктура

```bash
docker compose up -d
```

Поднимает PostgreSQL на порту `5433` (внешний, чтобы не конфликтовать с локальной установкой PostgreSQL на `5432`) и Redis на `6379`.

Проверить состояние:

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

API доступен на `http://localhost:3000/api`, Swagger — на `http://localhost:3000/api/docs`.

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

Приложение доступно на `http://localhost:5173`.

## Переменные окружения

Файл `backend/.env` создаётся из `backend/.env.example`. Все переменные обязательны и проверяются при старте приложения.

| Переменная     | Описание                                    |
| -------------- | ------------------------------------------- |
| `DATABASE_URL` | строка подключения к PostgreSQL             |
| `JWT_SECRET`   | секрет для подписи JWT access token         |
| `REDIS_URL`    | строка подключения к Redis                  |
| `PORT`         | порт HTTP-сервера                           |
| `FRONTEND_URL` | origin фронтенда, используется для CORS     |

Учётные данные в `DATABASE_URL` должны совпадать с переменными `POSTGRES_*` в `docker-compose.yml`.

## Полезные команды

### Backend

| Команда                 | Описание                            |
| ----------------------- | ----------------------------------- |
| `pnpm run start:dev`    | запуск в watch-режиме               |
| `pnpm run build`        | production-сборка                   |
| `pnpm run lint`         | ESLint с автоисправлением           |
| `pnpm run test`         | unit-тесты                          |
| `pnpm run test:e2e`     | e2e-тесты                           |
| `pnpm prisma migrate dev` | создать и применить миграцию      |
| `pnpm prisma generate`  | сгенерировать Prisma Client         |
| `pnpm prisma studio`    | просмотр данных в браузере          |

### Frontend

| Команда            | Описание                  |
| ------------------ | ------------------------- |
| `pnpm run dev`     | dev-сервер Vite           |
| `pnpm run build`   | production-сборка         |
| `pnpm run lint`    | ESLint                    |
| `pnpm run preview` | предпросмотр сборки       |

## Health check

```bash
curl http://localhost:3000/api/health
```

Возвращает `200`, если приложение работает и доступна база данных, иначе `503`.

## Разработка

Правила архитектуры, стиля кода и работы с Git описаны в [AGENTS.md](./AGENTS.md) и обязательны к соблюдению.
