import { z } from 'zod'
import { TASK_PRIORITY, TASK_STATUS } from './types'

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Введите название')
    .max(200, 'Название не должно превышать 200 символов'),
  description: z
    .string()
    .trim()
    .max(2000, 'Описание не должно превышать 2000 символов'),
  status: z.enum(TASK_STATUS),
  priority: z.enum(TASK_PRIORITY),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
