# Opkit Frontend

React + Vite приложение на Feature-Sliced Design.

## Запуск

```bash
pnpm install
cp .env.example .env
pnpm run dev
```

Приложение: http://localhost:5173

## Переменные окружения

| Переменная | Описание |
| ---------- | -------- |
| `VITE_API_URL` | базовый URL backend API (`http://localhost:3000/api`) |

## Структура (FSD)

```
src/
  app/        providers, router, layouts
  pages/      страницы
  widgets/    крупные блоки UI
  features/   пользовательские действия (следующий спринт)
  entities/   бизнес-сущности (следующий спринт)
  shared/     api, config, ui, lib
```
