import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SEASON_COLORS = {
  Spring: { bg: 'bg-spring/20', text: 'text-green-800', border: 'border-spring/40', hex: '#7ec850' },
  Summer: { bg: 'bg-summer/20', text: 'text-yellow-800', border: 'border-summer/40', hex: '#f5c542' },
  Fall: { bg: 'bg-fall/20', text: 'text-orange-800', border: 'border-fall/40', hex: '#e07030' },
  Winter: { bg: 'bg-winter/20', text: 'text-blue-800', border: 'border-winter/40', hex: '#80b0e0' },
} as const

export const SEASON_ICONS = {
  Spring: '🌸',
  Summer: '☀️',
  Fall: '🍂',
  Winter: '❄️',
} as const

export function formatGold(amount: number): string {
  return `${amount.toLocaleString()}g`
}

export function getProfitPerDay(crop: {
  sellPrice: number
  buyPrice: number
  growDays: number
  regrowDays?: number | null
}): number {
  const { sellPrice, buyPrice, growDays, regrowDays } = crop
  if (regrowDays) {
    // For regrowable crops, assume infinite regrows over a 28-day season
    const firstHarvest = growDays
    const remaining = 28 - firstHarvest
    const extraHarvests = Math.floor(remaining / regrowDays)
    const totalHarvests = 1 + extraHarvests
    const profit = totalHarvests * sellPrice - buyPrice
    return Math.round(profit / 28)
  }
  const profit = sellPrice - buyPrice
  return Math.round(profit / growDays)
}
