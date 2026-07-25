import type { SelectOption } from '@/shared/ui'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from './labels'
import { TASK_PRIORITY, TASK_STATUS } from './types'

export const TASK_STATUS_OPTIONS: readonly SelectOption[] = [
  { value: TASK_STATUS.TODO, label: TASK_STATUS_LABELS.TODO },
  { value: TASK_STATUS.IN_PROGRESS, label: TASK_STATUS_LABELS.IN_PROGRESS },
  { value: TASK_STATUS.DONE, label: TASK_STATUS_LABELS.DONE },
]

export const TASK_PRIORITY_OPTIONS: readonly SelectOption[] = [
  { value: TASK_PRIORITY.LOW, label: TASK_PRIORITY_LABELS.LOW },
  { value: TASK_PRIORITY.MEDIUM, label: TASK_PRIORITY_LABELS.MEDIUM },
  { value: TASK_PRIORITY.HIGH, label: TASK_PRIORITY_LABELS.HIGH },
]
