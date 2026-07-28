import { describe, expect, it } from 'vitest'
import {
  evaluatePasswordStrength,
  getFirstFailedPasswordRule,
} from './password-strength'
import { registerSchema } from './schema'

describe('evaluatePasswordStrength', () => {
  it('возвращает empty для пустого пароля', () => {
    const result = evaluatePasswordStrength('')

    expect(result.level).toBe('empty')
    expect(result.score).toBe(0)
  })

  it('считает короткий пароль слабым', () => {
    const result = evaluatePasswordStrength('abc')

    expect(result.level).toBe('weak')
    expect(result.rules.find((rule) => rule.id === 'length')?.met).toBe(false)
  })

  it('считает полный набор правил надёжным', () => {
    const result = evaluatePasswordStrength('StrongPass123!')

    expect(result.level).toBe('strong')
    expect(result.score).toBe(5)
    expect(result.label).toBe('Надёжный')
    expect(result.rules.every((rule) => rule.met)).toBe(true)
  })
})

describe('registerSchema password rules', () => {
  it('отклоняет пароль без спецсимвола', () => {
    const result = registerSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'StrongPass123',
      confirmPassword: 'StrongPass123',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Спецсимвол')
    }
  })

  it('принимает сложный пароль', () => {
    const result = registerSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    })

    expect(result.success).toBe(true)
  })

  it('getFirstFailedPasswordRule возвращает первое невыполненное правило', () => {
    expect(getFirstFailedPasswordRule('short')?.id).toBe('length')
    expect(getFirstFailedPasswordRule('longenough')?.id).toBe('upper')
  })
})
