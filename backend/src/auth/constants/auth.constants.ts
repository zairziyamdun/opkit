export const REFRESH_COOKIE_NAME = 'opkit_refresh_token' as const;

/** Access token TTL в секундах (15 минут). */
export const DEFAULT_ACCESS_TOKEN_SECONDS = 15 * 60;

export const DEFAULT_REFRESH_TOKEN_DAYS = 7 as const;

/** Лимит проверок текущего пароля: запросов на пользователя за окно. */
export const VERIFY_PASSWORD_RATE_LIMIT = 15 as const;
export const VERIFY_PASSWORD_RATE_WINDOW_SECONDS = 60 as const;

/** Лимит попыток входа: запросов с IP за окно. */
export const LOGIN_RATE_LIMIT = 15 as const;
export const LOGIN_RATE_WINDOW_SECONDS = 60 as const;
