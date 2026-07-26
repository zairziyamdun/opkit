import { LoginForm } from '@/features/login'

export function LoginPanel() {
  return (
    <section className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-h2 font-semibold tracking-tight text-foreground">
          Вход
        </h1>
        <p className="text-small text-muted-foreground">
          Войдите в аккаунт, чтобы управлять задачами
        </p>
      </div>
      <div className="rounded-card border border-border bg-card p-6 shadow-card">
        <LoginForm />
      </div>
    </section>
  )
}
