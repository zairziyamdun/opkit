import { useEffect, useState } from 'react'

export function useDebouncedValue<TValue>(
  value: TValue,
  delayMs = 400,
): TValue {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [value, delayMs])

  return debouncedValue
}
