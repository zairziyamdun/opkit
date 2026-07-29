import type { ReactNode } from 'react'

interface ProfileFieldProps {
  readonly icon: ReactNode
  readonly label: string
  readonly value: string
  readonly mono?: boolean
  readonly action?: ReactNode
}

export function ProfileField({
  icon,
  label,
  value,
  mono = false,
  action,
}: ProfileFieldProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-caption font-medium text-muted-foreground">
            {label}
          </p>
          <p
            className={
              mono
                ? 'break-all font-mono text-caption text-foreground'
                : 'break-words text-small font-medium text-foreground'
            }
          >
            {value}
          </p>
        </div>
      </div>
      {action ? (
        <div className="shrink-0 self-end sm:self-center">{action}</div>
      ) : null}
    </div>
  )
}
