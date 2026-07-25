import { RegisterForm } from '@/features/register'

export function RegisterPanel() {
  return (
    <section className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Регистрация</h1>
        <p className="text-sm text-muted-foreground">
          Создайте аккаунт Opkit за минуту
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <RegisterForm />
      </div>
    </section>
  )
}
