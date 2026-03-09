'use client'

import { useState } from 'react'

const CATEGORY_EMOJIS: Record<string, string> = {
  Fish: '🐟',
  Mineral: '💎',
  Forage: '🌿',
  'Animal Product': '🥚',
  'Artisan Good': '🍷',
  'Cooked Food': '🍳',
  Crop: '🌾',
  Resource: '🪵',
}

interface StardewItemIconProps {
  name: string
  category?: string
  size?: number
  className?: string
}

export function StardewItemIcon({ name, category, size = 32, className }: StardewItemIconProps) {
  const [error, setError] = useState(false)
  const fallbackEmoji = CATEGORY_EMOJIS[category ?? ''] ?? '📦'

  const fileName = name.replace(/\s+/g, '_')
  const localUrl = `/icons/items/${fileName}.png`

  if (error) {
    return (
      <span
        className={className}
        style={{ fontSize: size * 0.75, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}
      >
        {fallbackEmoji}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={localUrl}
      alt={name}
      onError={() => setError(true)}
      className={className}
      style={{
        imageRendering: 'pixelated',
        width: size,
        height: size,
        objectFit: 'contain',
      }}
    />
  )
}
