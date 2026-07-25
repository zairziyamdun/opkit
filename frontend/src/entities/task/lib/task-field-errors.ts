import type { TaskFormValues } from '@/entities/task/model/task-form-schema'
import { isApiError } from '@/shared/api'

export type TaskFieldErrorSetter = (
  field: keyof TaskFormValues,
  message: string,
) => void

const TASK_FORM_FIELDS: readonly (keyof TaskFormValues)[] = [
  'title',
  'description',
  'status',
  'priority',
]

export function applyTaskFieldErrors(
  error: unknown,
  setFieldError: TaskFieldErrorSetter,
): void {
  if (!isApiError(error)) {
    return
  }

  for (const fieldError of error.fieldErrors) {
    const field = TASK_FORM_FIELDS.find((item) => item === fieldError.field)
    const message = fieldError.messages[0]

    if (field && message) {
      setFieldError(field, message)
    }
  }
}
