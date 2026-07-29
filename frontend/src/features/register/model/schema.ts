import { z } from 'zod'
import {
  PASSWORD_MAX_LENGTH,
  getFirstFailedPasswordRule,
} from '@/shared/lib/password-strength'

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
      .min(1, 'Введите пароль')
      .max(PASSWORD_MAX_LENGTH, 'Пароль слишком длинный')
      .superRefine((password, context) => {
        const failedRule = getFirstFailedPasswordRule(password)

        if (failedRule) {
          context.addIssue({
            code: 'custom',
            message: failedRule.label,
          })
        }
      }),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
