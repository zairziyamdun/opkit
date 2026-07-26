import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-button text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:text-primary-foreground',
        secondary:
          'border border-border-hover bg-card text-foreground hover:bg-background',
        outline:
          'border border-border-hover bg-card text-foreground hover:bg-background',
        ghost: 'text-foreground-body hover:bg-muted',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-caption',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  readonly isLoading?: boolean
}

export function Button({
  className,
  variant,
  size,
  isLoading = false,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  )
}
