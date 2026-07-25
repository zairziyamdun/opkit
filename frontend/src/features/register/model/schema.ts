import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Имя должно содержать минимум 2 символа')
      .max(100, 'Имя слишком длинное'),
    email: z
      .string()
      .trim()
      .min(1, 'Введите email')
      .email('Некорректный email'),
    password: z
      .string()
      .min(8, 'Пароль должен содержать минимум 8 символов')
      .max(72, 'Пароль слишком длинный'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
