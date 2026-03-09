'use client'

import { useState, useMemo } from 'react'
import { ShippingItem } from '@prisma/client'
import { cn, formatGold, SEASON_ICONS } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Check, Search } from 'lucide-react'

type ShippingItemWithProgress = ShippingItem & { shipped?: boolean }

interface ShippingGridProps {
  items: ShippingItemWithProgress[]
  initialChecked: Record<number, boolean>
}

const CATEGORY_COLORS: Record<string, string> = {
  Crops: 'spring',
  'Fruit Trees': 'summer',
  'Artisan Goods': 'gold',
  Forage: 'fall',
  'Animal Products': 'winter',
  Fish: 'default',
  Mining: 'default',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Crops: '🌽',
  'Fruit Trees': '🍎',
  'Artisan Goods': '🍷',
  Forage: '🍄',
  'Animal Products': '🥚',
  Fish: '🐟',
  Mining: '⛏️',
}

export function ShippingGrid({ items, initialChecked }: ShippingGridProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>(initialChecked)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [hideCompleted, setHideCompleted] = useState(false)

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (hideCompleted && checked[item.id]) return false
      if (activeCategory && item.category !== activeCategory) return false
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [items, checked, search, activeCategory, hideCompleted])

  const grouped = useMemo(() => {
    const groups: Record<string, ShippingItemWithProgress[]> = {}
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [filtered])

  const totalChecked = Object.values(checked).filter(Boolean).length

  async function toggle(itemId: number) {
    const newVal = !checked[itemId]
    setChecked((prev) => ({ ...prev, [itemId]: newVal }))

    // Persist to API
    try {
      await fetch('/api/progress/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, shipped: newVal }),
      })
    } catch {
      // If not logged in, state stays in memory
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="card-stardew p-4">
        <Progress
          value={totalChecked}
          max={items.length}
          label={`Shipping Collection`}
          showPercent
          color="bg-stardew-green"
        />
        <p className="text-xs text-stardew-brown mt-1 font-semibold">
          {totalChecked} / {items.length} items shipped
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stardew-brown/50" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-stardew-brown cursor-pointer">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="rounded"
          />
          Hide completed
        </label>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all',
            !activeCategory
              ? 'bg-stardew-brown text-stardew-cream border-stardew-brown'
              : 'bg-white/50 border-stardew-brown/30 text-stardew-brown hover:bg-stardew-brown/10'
          )}
        >
          All
        </button>
        {categories.map((cat) => {
          const catChecked = items.filter((i) => i.category === cat && checked[i.id]).length
          const catTotal = items.filter((i) => i.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all flex items-center gap-1.5',
                activeCategory === cat
                  ? 'bg-stardew-brown text-stardew-cream border-stardew-brown'
                  : 'bg-white/50 border-stardew-brown/30 text-stardew-brown hover:bg-stardew-brown/10'
              )}
            >
              <span>{CATEGORY_EMOJIS[cat] ?? '•'}</span>
              <span>{cat}</span>
              <span className="opacity-60">({catChecked}/{catTotal})</span>
            </button>
          )
        })}
      </div>

      {/* Item groups */}
      {Object.entries(grouped).map(([category, categoryItems]) => {
        const catChecked = categoryItems.filter((i) => checked[i.id]).length
        return (
          <div key={category} className="card-stardew overflow-hidden">
            <div className="px-4 py-3 bg-stardew-brown/5 border-b border-stardew-brown/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{CATEGORY_EMOJIS[category] ?? '•'}</span>
                <h3 className="font-pixel text-xs text-stardew-brown-dark">{category}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24">
                  <Progress value={catChecked} max={categoryItems.length} color="bg-stardew-green" />
                </div>
                <span className="text-xs font-semibold text-stardew-brown">
                  {catChecked}/{categoryItems.length}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stardew-brown/5">
              {categoryItems.map((item) => (
                <ShippingItemCard
                  key={item.id}
                  item={item}
                  isChecked={!!checked[item.id]}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-stardew-brown font-semibold">
          No items match your filters.
        </div>
      )}
    </div>
  )
}

function ShippingItemCard({
  item,
  isChecked,
  onToggle,
}: {
  item: ShippingItemWithProgress
  isChecked: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'bg-white/40 p-3 text-left flex items-start gap-3 hover:bg-stardew-brown/5 transition-all duration-100 group',
        isChecked && 'bg-stardew-green/10'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'stardew-checkbox mt-0.5 flex-shrink-0',
          isChecked && 'checked'
        )}
      >
        {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold text-sm truncate', isChecked ? 'line-through text-stardew-brown/50' : 'text-stardew-brown-dark')}>
          {item.name}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="text-xs text-stardew-brown font-semibold">{formatGold(item.basePrice)}</span>
          {item.silverPrice && (
            <span className="text-xs text-gray-500">· {formatGold(item.silverPrice)}🥈</span>
          )}
          {item.goldPrice && (
            <span className="text-xs text-yellow-600">· {formatGold(item.goldPrice)}🥇</span>
          )}
          {item.iridiumPrice && (
            <span className="text-xs text-purple-600">· {formatGold(item.iridiumPrice)}💜</span>
          )}
        </div>
        {item.season && (
          <span className="text-xs text-stardew-brown/60 font-semibold">
            {SEASON_ICONS[item.season as keyof typeof SEASON_ICONS] ?? ''} {item.season}
          </span>
        )}
      </div>
    </button>
  )
}
