import { LoginForm } from '@/features/login'

export function LoginPanel() {
  return (
    <section className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>
        <p className="text-sm text-muted-foreground">
          Войдите в аккаунт, чтобы управлять задачами
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>
    </section>
  )
}
