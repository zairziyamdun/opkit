import { describe, expect, it } from 'vitest'
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { getErrorMessage, toApiError } from './error'

function createAxiosError(
  status: number | undefined,
  data?: unknown,
  message = 'Request failed with status code 500',
  code?: string,
): AxiosError {
  const error = new AxiosError(message, code)
  if (status !== undefined) {
    error.response = {
      status,
      data,
      statusText: 'Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    } as AxiosResponse
  }
  return error
}

describe('toApiError', () => {
  it('мапит network error в понятное сообщение', () => {
    const result = toApiError(
      createAxiosError(undefined, undefined, 'Network Error', 'ERR_NETWORK'),
    )

    expect(result.statusCode).toBe(0)
    expect(result.message).toContain('подключиться к серверу')
  })

  it('мапит 401 Unauthorized в сообщение о сеансе', () => {
    const result = toApiError(
      createAxiosError(401, { statusCode: 401, message: 'Unauthorized' }),
    )

    expect(result.message).toBe('Сеанс завершён. Войдите снова.')
  })

  it('мапит Invalid credentials в сообщение для входа', () => {
    const result = toApiError(
      createAxiosError(401, {
        statusCode: 401,
        message: 'Invalid credentials',
      }),
    )

    expect(result.message).toBe('Неверный email или пароль.')
  })

  it('мапит Email already exists', () => {
    const result = toApiError(
      createAxiosError(409, {
        statusCode: 409,
        message: 'Email already exists',
      }),
    )

    expect(result.message).toBe('Такой email уже зарегистрирован.')
  })

  it('не показывает axios status code message', () => {
    const result = toApiError(
      createAxiosError(500, undefined, 'Request failed with status code 500'),
    )

    expect(result.message).not.toMatch(/status code/i)
    expect(result.message).toContain('Что-то пошло не так')
  })

  it('сохраняет безопасные русские сообщения', () => {
    const result = toApiError(
      createAxiosError(400, {
        statusCode: 400,
        message: 'Проверьте название задачи',
      }),
    )

    expect(result.message).toBe('Проверьте название задачи')
  })
})

describe('getErrorMessage', () => {
  it('не показывает технический Error.message', () => {
    const message = getErrorMessage(
      new Error('Request failed with status code 401'),
      'Не удалось подтвердить вход. Войдите снова.',
    )

    expect(message).toBe('Не удалось подтвердить вход. Войдите снова.')
  })

  it('возвращает безопасное сообщение из ApiError', () => {
    const message = getErrorMessage({
      statusCode: 403,
      message: 'Forbidden',
      fieldErrors: [],
    })

    expect(message).toBe('У вас нет доступа к этому действию.')
  })
})
