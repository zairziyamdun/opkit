import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { TaskFieldErrorSetter } from '@/entities/task/lib/task-field-errors'
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '@/entities/task/model/options'
import {
  taskFormSchema,
  type TaskFormValues,
} from '@/entities/task/model/task-form-schema'
import { TASK_PRIORITY, TASK_STATUS } from '@/entities/task/model/types'
import { Alert, Button, Input, Label, Select, Textarea } from '@/shared/ui'

interface TaskFormProps {
  readonly idPrefix: string
  readonly submitLabel: string
  readonly isPending: boolean
  readonly errorMessage?: string
  readonly defaultValues?: TaskFormValues
  readonly onSubmit: (
    values: TaskFormValues,
    setFieldError: TaskFieldErrorSetter,
  ) => Promise<void>
  readonly onCancel: () => void
}

const EMPTY_TASK_FORM_VALUES: TaskFormValues = {
  title: '',
  description: '',
  status: TASK_STATUS.TODO,
  priority: TASK_PRIORITY.MEDIUM,
}

export function TaskForm({
  idPrefix,
  submitLabel,
  isPending,
  errorMessage,
  defaultValues = EMPTY_TASK_FORM_VALUES,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit(values, (field, message) => {
      setError(field, { message })
    })
  })

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>Название</Label>
        <Input
          id={`${idPrefix}-title`}
          type="text"
          hasError={Boolean(errors.title)}
          {...register('title')}
        />
        {errors.title ? (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Описание</Label>
        <Textarea
          id={`${idPrefix}-description`}
          hasError={Boolean(errors.description)}
          {...register('description')}
        />
        {errors.description ? (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-status`}>Статус</Label>
          <Select
            id={`${idPrefix}-status`}
            options={TASK_STATUS_OPTIONS}
            hasError={Boolean(errors.status)}
            {...register('status')}
          />
          {errors.status ? (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-priority`}>Приоритет</Label>
          <Select
            id={`${idPrefix}-priority`}
            options={TASK_PRIORITY_OPTIONS}
            hasError={Boolean(errors.priority)}
            {...register('priority')}
          />
          {errors.priority ? (
            <p className="text-sm text-destructive">{errors.priority.message}</p>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">{errorMessage}</Alert>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onCancel}
          disabled={isPending}
        >
          Отмена
        </Button>
        <Button type="submit" className="w-full sm:w-auto" isLoading={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}