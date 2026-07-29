import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Input } from './input'

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly hasError?: boolean
  readonly hasSuccess?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className, hasError = false, hasSuccess = false, disabled, ...props },
    ref,
  ) {
    const [isVisible, setIsVisible] = useState(false)

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          hasError={hasError}
          hasSuccess={hasSuccess}
          disabled={disabled}
          className={cn('pr-11', className)}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
          className={cn(
            'absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50',
            hasSuccess && !hasError
              ? 'text-success hover:text-success'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => setIsVisible((prev) => !prev)}
        >
          {isVisible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    )
  },
)
