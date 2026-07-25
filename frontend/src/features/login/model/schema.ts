import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
