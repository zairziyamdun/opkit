export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

export interface PasswordRule {
  readonly id: string
  readonly label: string
  readonly test: (password: string) => boolean
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: 'length',
    label: `Не менее ${PASSWORD_MIN_LENGTH} символов`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'lower',
    label: 'Строчная буква (a–z)',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'upper',
    label: 'Заглавная буква (A–Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'digit',
    label: 'Цифра (0–9)',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'symbol',
    label: 'Спецсимвол (!@#$%…)',
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
] as const

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrength {
  readonly level: PasswordStrengthLevel
  readonly score: number
  readonly label: string
  readonly rules: ReadonlyArray<{
    readonly id: string
    readonly label: string
    readonly met: boolean
  }>
}

const STRENGTH_LABELS: Record<Exclude<PasswordStrengthLevel, 'empty'>, string> =
  {
    weak: 'Слабый',
    fair: 'Средний',
    good: 'Хороший',
    strong: 'Надёжный',
  }

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const rules = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password),
  }))

  if (password.length === 0) {
    return {
      level: 'empty',
      score: 0,
      label: '',
      rules,
    }
  }

  const score = rules.filter((rule) => rule.met).length
  const level: Exclude<PasswordStrengthLevel, 'empty'> =
    score <= 2 ? 'weak' : score === 3 ? 'fair' : score === 4 ? 'good' : 'strong'

  return {
    level,
    score,
    label: STRENGTH_LABELS[level],
    rules,
  }
}

export function getFirstFailedPasswordRule(
  password: string,
): PasswordRule | null {
  return PASSWORD_RULES.find((rule) => !rule.test(password)) ?? null
}
