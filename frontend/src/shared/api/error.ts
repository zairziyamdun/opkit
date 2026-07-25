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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNestErrorBody(value: unknown): value is NestErrorBody {
  return isRecord(value)
}

function parseFieldErrors(message: NestErrorBody['message']): ApiFieldError[] {
  if (!Array.isArray(message)) {
    return []
  }

  if (message.every((item) => typeof item === 'string')) {
    return [
      {
        field: 'root',
        messages: message,
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
      messages: Object.values(item.constraints ?? {}),
    }))
    .filter((item) => item.messages.length > 0)
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Произошла ошибка',
): string {
  if (isApiError(error)) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
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
  const statusCode = axiosError.response?.status ?? 500
  const body = axiosError.response?.data

  if (!isNestErrorBody(body)) {
    return {
      statusCode,
      message:
        axiosError.message ||
        (statusCode === 0
          ? 'Сервер недоступен. Проверьте подключение.'
          : 'Произошла ошибка запроса'),
      fieldErrors: [],
    }
  }

  const fieldErrors = parseFieldErrors(body.message)
  const messageFromBody = body.message

  let message = 'Произошла ошибка запроса'

  if (typeof messageFromBody === 'string') {
    message = messageFromBody
  } else if (
    Array.isArray(messageFromBody) &&
    messageFromBody.every((item) => typeof item === 'string')
  ) {
    message = messageFromBody.join(', ')
  } else if (typeof body.error === 'string') {
    message = body.error
  } else if (fieldErrors.length > 0) {
    message = fieldErrors.flatMap((item) => item.messages).join(', ')
  }

  return {
    statusCode,
    message,
    fieldErrors,
  }
}
