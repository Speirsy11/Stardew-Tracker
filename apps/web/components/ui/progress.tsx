'use client'

import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  color?: string
  label?: string
  showPercent?: boolean
}

export function Progress({ value, max = 100, className, color = 'bg-stardew-green', label, showPercent }: ProgressProps) {
  const pct = Math.round((value / max) * 100)

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-semibold text-stardew-brown">
          {label && <span>{label}</span>}
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div
          className={cn('progress-fill', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
