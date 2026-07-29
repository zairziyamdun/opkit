import { z } from 'zod'
import {
  PASSWORD_MAX_LENGTH,
  getFirstFailedPasswordRule,
} from '@/shared/lib/password-strength'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z
      .string()
      .min(1, 'Введите новый пароль')
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
    confirmNewPassword: z.string().min(1, 'Подтвердите новый пароль'),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmNewPassword'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
