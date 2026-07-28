import { RegisterForm } from '@/features/register'

export function RegisterPanel() {
  return (
    <section className="mx-auto w-full max-w-md space-y-5 sm:space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-h2 font-semibold tracking-tight text-foreground">
          Регистрация
        </h1>
        <p className="text-small text-muted-foreground">
          Создайте аккаунт Opkit за минуту
        </p>
      </div>
      <div className="rounded-card border border-border bg-card p-4 shadow-card sm:p-6">
        <RegisterForm />
      </div>
    </section>
  )
}
