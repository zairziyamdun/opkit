import { Check, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import {
  evaluatePasswordStrength,
  type PasswordStrengthLevel,
} from '../model/password-strength'

interface PasswordStrengthMeterProps {
  readonly password: string
}

const LEVEL_BAR: Record<
  Exclude<PasswordStrengthLevel, 'empty'>,
  { readonly width: string; readonly color: string }
> = {
  weak: { width: 'w-1/4', color: 'bg-destructive' },
  fair: { width: 'w-2/4', color: 'bg-warning' },
  good: { width: 'w-3/4', color: 'bg-primary' },
  strong: { width: 'w-full', color: 'bg-success' },
}

const LEVEL_TEXT: Record<
  Exclude<PasswordStrengthLevel, 'empty'>,
  string
> = {
  weak: 'text-destructive',
  fair: 'text-warning',
  good: 'text-primary',
  strong: 'text-success',
}

export function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const strength = evaluatePasswordStrength(password)

  if (strength.level === 'empty') {
    return (
      <ul className="space-y-1.5 pt-1" aria-label="Требования к паролю">
        {strength.rules.map((rule) => (
          <li
            key={rule.id}
            className="flex items-center gap-2 text-caption text-muted-foreground"
          >
            <span className="size-3.5 shrink-0 rounded-full border border-border-hover" />
            {rule.label}
          </li>
        ))}
      </ul>
    )
  }

  const bar = LEVEL_BAR[strength.level]

  return (
    <div className="space-y-2 pt-1">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-caption text-muted-foreground">Надёжность</p>
          <p
            className={cn(
              'text-caption font-medium',
              LEVEL_TEXT[strength.level],
            )}
          >
            {strength.label}
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-200',
              bar.width,
              bar.color,
            )}
          />
        </div>
      </div>

      <ul className="space-y-1.5" aria-label="Требования к паролю">
        {strength.rules.map((rule) => (
          <li
            key={rule.id}
            className={cn(
              'flex items-center gap-2 text-caption',
              rule.met ? 'text-success' : 'text-muted-foreground',
            )}
          >
            {rule.met ? (
              <Check className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <X className="size-3.5 shrink-0" aria-hidden />
            )}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
