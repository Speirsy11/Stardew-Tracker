import { cn } from '@/lib/utils'
import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-stardew-brown text-stardew-cream hover:bg-stardew-brown-dark border-2 border-stardew-brown-dark/30',
  secondary: 'bg-stardew-cream-dark text-stardew-brown hover:bg-stardew-brown/10 border-2 border-stardew-brown/30',
  ghost: 'text-stardew-brown hover:bg-stardew-brown/10',
  outline: 'border-2 border-stardew-brown/40 text-stardew-brown hover:bg-stardew-brown/10 bg-transparent',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
