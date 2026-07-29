import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/register/model/schema'
import { useRegisterMutation } from '@/features/register/model/use-register'
import { getErrorMessage, isApiError } from '@/shared/api'
import { ROUTES } from '@/shared/config/routes'
import { Alert, Button, Input, Label, PasswordInput } from '@/shared/ui'
import { PasswordStrengthMeter } from './password-strength-meter'

export function RegisterForm() {
  const registerMutation = useRegisterMutation()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = useWatch({ control, name: 'password' }) ?? ''

  const onSubmit = handleSubmit(async ({ name, email, password: value }) => {
    try {
      await registerMutation.mutateAsync({ name, email, password: value })
    } catch (error: unknown) {
      if (isApiError(error) && error.fieldErrors.length > 0) {
        for (const fieldError of error.fieldErrors) {
          if (
            fieldError.field === 'name' ||
            fieldError.field === 'email' ||
            fieldError.field === 'password'
          ) {
            setError(fieldError.field, {
              message: fieldError.messages[0],
            })
          }
        }
      }
    }
  })

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="register-name">Имя</Label>
        <Input
          id="register-name"
          type="text"
          autoComplete="name"
          hasError={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          hasError={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Пароль</Label>
        <PasswordInput
          id="register-password"
          autoComplete="new-password"
          hasError={Boolean(errors.password)}
          {...register('password')}
        />
        <PasswordStrengthMeter password={password} />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm-password">Подтверждение пароля</Label>
        <PasswordInput
          id="register-confirm-password"
          autoComplete="new-password"
          hasError={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      {registerMutation.isError ? (
        <Alert variant="destructive">
          {getErrorMessage(
            registerMutation.error,
            'Не удалось зарегистрироваться',
          )}
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        isLoading={registerMutation.isPending}
      >
        Создать аккаунт
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <Link
          to={ROUTES.login}
          className="font-medium text-foreground underline"
        >
          Войти
        </Link>
      </p>
    </form>
  )
}
