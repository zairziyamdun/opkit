import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { loginSchema, type LoginFormValues } from '@/features/login/model/schema'
import { useLoginMutation } from '@/features/login/model/use-login'
import { getErrorMessage, isApiError } from '@/shared/api'
import { ROUTES } from '@/shared/config/routes'
import { Alert, Button, Input, Label, PasswordInput } from '@/shared/ui'

export function LoginForm() {
  const loginMutation = useLoginMutation()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values)
    } catch (error: unknown) {
      if (isApiError(error) && error.fieldErrors.length > 0) {
        for (const fieldError of error.fieldErrors) {
          if (fieldError.field === 'email' || fieldError.field === 'password') {
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
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
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
        <Label htmlFor="login-password">Пароль</Label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          hasError={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {loginMutation.isError ? (
        <Alert variant="destructive">
          {getErrorMessage(loginMutation.error, 'Неверный email или пароль')}
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        isLoading={loginMutation.isPending}
      >
        Войти
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта?{' '}
        <Link
          to={ROUTES.register}
          className="font-medium text-foreground underline"
        >
          Зарегистрироваться
        </Link>
      </p>
    </form>
  )
}
