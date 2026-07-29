import type { AxiosError } from 'axios'
import type { ApiError, ApiFieldError } from '@/shared/types/api-error'

interface NestValidationItem {
  readonly property?: string
  readonly constraints?: Record<string, string>
}

interface NestErrorBody {
  readonly statusCode?: number
  readonly message?: string | string[] | NestValidationItem[]
  readonly error?: string
}

const STATUS_MESSAGES: Readonly<Record<number, string>> = {
  400: 'Проверьте введённые данные и попробуйте снова.',
  401: 'Сеанс завершён. Войдите снова.',
  403: 'У вас нет доступа к этому действию.',
  404: 'Запрашиваемые данные не найдены.',
  409: 'Конфликт данных. Проверьте введённую информацию.',
  422: 'Проверьте введённые данные и попробуйте снова.',
  429: 'Слишком много попыток. Попробуйте немного позже.',
  500: 'Что-то пошло не так. Попробуйте позже.',
  502: 'Что-то пошло не так. Попробуйте позже.',
  503: 'Сервис временно недоступен. Попробуйте позже.',
  504: 'Что-то пошло не так. Попробуйте позже.',
}

const KNOWN_SERVER_MESSAGES: Readonly<Record<string, string>> = {
  'invalid credentials': 'Неверный email или пароль.',
  'email already exists': 'Такой email уже зарегистрирован.',
  'user not found': 'Сеанс завершён. Войдите снова.',
  'task not found': 'Задача не найдена.',
  'at least one field must be provided':
    'Укажите хотя бы одно поле для изменения.',
  'invalid current password': 'Неверный текущий пароль.',
  'new password must be different from the current password':
    'Новый пароль должен отличаться от текущего.',
  unauthorized: 'Сеанс завершён. Войдите снова.',
  forbidden: 'У вас нет доступа к этому действию.',
  'bad request': 'Проверьте введённые данные и попробуйте снова.',
  'not found': 'Запрашиваемые данные не найдены.',
  conflict: 'Конфликт данных. Проверьте введённую информацию.',
  'internal server error': 'Что-то пошло не так. Попробуйте позже.',
  'too many requests': 'Слишком много попыток. Попробуйте немного позже.',
}

const TECHNICAL_MESSAGE_PATTERN =
  /jwt|bearer|token|localstorage|\/auth\/|socket\.?io|websocket|redis|prisma|sql|cors|stack|exception|econnaborted|etimedout|network error|request failed|status code|axioserror|aggregateerror|internal server|unauthorized|forbidden/i

const CYRILLIC_PATTERN = /[А-Яа-яЁё]/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNestErrorBody(value: unknown): value is NestErrorBody {
  return isRecord(value)
}

function messageForStatus(statusCode: number): string {
  if (STATUS_MESSAGES[statusCode]) {
    return STATUS_MESSAGES[statusCode]
  }

  if (statusCode >= 500) {
    return 'Что-то пошло не так. Попробуйте позже.'
  }

  if (statusCode === 0) {
    return 'Не удалось подключиться к серверу. Проверьте соединение и попробуйте снова.'
  }

  return 'Произошла ошибка. Попробуйте ещё раз.'
}

function mapKnownMessage(message: string): string | null {
  const normalized = message.trim().toLowerCase()
  return KNOWN_SERVER_MESSAGES[normalized] ?? null
}

function isSafeUserMessage(message: string): boolean {
  const trimmed = message.trim()

  if (trimmed.length === 0 || trimmed.length > 200) {
    return false
  }

  if (TECHNICAL_MESSAGE_PATTERN.test(trimmed)) {
    return false
  }

  return CYRILLIC_PATTERN.test(trimmed)
}

function sanitizeUserMessage(
  message: string | undefined,
  statusCode: number,
): string {
  if (!message) {
    return messageForStatus(statusCode)
  }

  const known = mapKnownMessage(message)
  if (known) {
    return known
  }

  if (isSafeUserMessage(message)) {
    return message.trim()
  }

  return messageForStatus(statusCode)
}

function sanitizeFieldMessage(message: string): string {
  const known = mapKnownMessage(message)
  if (known) {
    return known
  }

  if (isSafeUserMessage(message)) {
    return message.trim()
  }

  const lower = message.toLowerCase()

  if (lower.includes('should not be empty') || lower.includes('must be a string')) {
    return 'Заполните это поле.'
  }

  if (lower.includes('must be an email')) {
    return 'Введите корректный email.'
  }

  if (lower.includes('must be longer') || lower.includes('must be shorter')) {
    return 'Проверьте длину значения.'
  }

  if (lower.includes('must be one of') || lower.includes('must be a valid enum')) {
    return 'Выберите корректное значение.'
  }

  return 'Проверьте это поле.'
}

function parseFieldErrors(message: NestErrorBody['message']): ApiFieldError[] {
  if (!Array.isArray(message)) {
    return []
  }

  if (message.every((item) => typeof item === 'string')) {
    return [
      {
        field: 'root',
        messages: message.map(sanitizeFieldMessage),
      },
    ]
  }

  return message
    .filter(
      (item): item is NestValidationItem =>
        typeof item === 'object' && item !== null && 'property' in item,
    )
    .filter((item) => typeof item.property === 'string')
    .map((item) => ({
      field: item.property as string,
      messages: Object.values(item.constraints ?? {}).map(sanitizeFieldMessage),
    }))
    .filter((item) => item.messages.length > 0)
}

function isNetworkFailure(error: AxiosError): boolean {
  if (!error.response) {
    return true
  }

  const code = error.code
  return (
    code === 'ERR_NETWORK' ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ERR_CANCELED'
  )
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Произошла ошибка. Попробуйте ещё раз.',
): string {
  if (isApiError(error)) {
    return sanitizeUserMessage(error.message, error.statusCode)
  }

  if (error instanceof Error && error.message && isSafeUserMessage(error.message)) {
    return error.message.trim()
  }

  return fallback
}

export function isApiError(error: unknown): error is ApiError {
  return (
    isRecord(error) &&
    typeof error.statusCode === 'number' &&
    typeof error.message === 'string' &&
    Array.isArray(error.fieldErrors)
  )
}

export function toApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<NestErrorBody>

  if (isNetworkFailure(axiosError) && !axiosError.response) {
    return {
      statusCode: 0,
      message:
        'Не удалось подключиться к серверу. Проверьте соединение и попробуйте снова.',
      fieldErrors: [],
    }
  }

  const statusCode = axiosError.response?.status ?? 500
  const body = axiosError.response?.data

  if (!isNestErrorBody(body)) {
    return {
      statusCode,
      message: messageForStatus(statusCode),
      fieldErrors: [],
    }
  }

  const fieldErrors = parseFieldErrors(body.message)
  const messageFromBody = body.message

  let rawMessage: string | undefined

  if (typeof messageFromBody === 'string') {
    rawMessage = messageFromBody
  } else if (
    Array.isArray(messageFromBody) &&
    messageFromBody.every((item) => typeof item === 'string')
  ) {
    rawMessage = messageFromBody.join(', ')
  } else if (typeof body.error === 'string') {
    rawMessage = body.error
  } else if (fieldErrors.length > 0) {
    return {
      statusCode,
      message: messageForStatus(statusCode === 400 ? 400 : statusCode),
      fieldErrors,
    }
  }

  return {
    statusCode,
    message: sanitizeUserMessage(rawMessage, statusCode),
    fieldErrors,
  }
}
