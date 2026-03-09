import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-xl border-2 border-stardew-brown/30 bg-white/70 px-4 py-2 text-sm text-stardew-brown-dark placeholder:text-stardew-brown/40 focus:border-stardew-brown focus:outline-none transition-colors',
      className
    )}
    {...props}
  />
))

Input.displayName = 'Input'
