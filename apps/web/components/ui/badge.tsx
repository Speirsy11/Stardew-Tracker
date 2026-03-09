import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'spring' | 'summer' | 'fall' | 'winter' | 'default' | 'gold'
  className?: string
}

const variants = {
  spring: 'bg-spring/20 text-green-800 border border-spring/40',
  summer: 'bg-summer/20 text-yellow-800 border border-summer/40',
  fall: 'bg-fall/20 text-orange-800 border border-fall/40',
  winter: 'bg-winter/20 text-blue-800 border border-winter/40',
  default: 'bg-stardew-brown/10 text-stardew-brown border border-stardew-brown/20',
  gold: 'bg-stardew-gold/20 text-yellow-800 border border-stardew-gold/40',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  )
}
