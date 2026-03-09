'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { GameItem } from '@prisma/client'
import { cn, formatGold } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { StardewItemIcon } from '@/components/items/stardew-item-icon'

interface ItemGridProps {
  items: GameItem[]
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Fish: '🐟',
  Mineral: '💎',
  Forage: '🍄',
  'Animal Product': 'Animal Product',
  'Artisan Good': '🍷',
  'Cooked Food': '🍳',
  Crop: '🌾',
  Resource: '🪵',
}

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  Fish: '🐟',
  Mineral: '💎',
  Forage: '🌿',
  'Animal Product': '🥚',
  'Artisan Good': '🍷',
  'Cooked Food': '🍳',
  Crop: '🌾',
  Resource: '🪵',
}

const CATEGORY_COLORS: Record<string, string> = {
  Fish: 'bg-blue-100 border-blue-300 text-blue-800',
  Mineral: 'bg-purple-100 border-purple-300 text-purple-800',
  Forage: 'bg-green-100 border-green-300 text-green-800',
  'Animal Product': 'bg-yellow-100 border-yellow-300 text-yellow-800',
  'Artisan Good': 'bg-red-100 border-red-300 text-red-800',
  'Cooked Food': 'bg-orange-100 border-orange-300 text-orange-800',
  Crop: 'bg-lime-100 border-lime-300 text-lime-800',
  Resource: 'bg-stone-100 border-stone-300 text-stone-800',
}

const CATEGORY_CARD_BG: Record<string, string> = {
  Fish: 'hover:border-blue-300',
  Mineral: 'hover:border-purple-300',
  Forage: 'hover:border-green-300',
  'Animal Product': 'hover:border-yellow-300',
  'Artisan Good': 'hover:border-red-300',
  'Cooked Food': 'hover:border-orange-300',
  Crop: 'hover:border-lime-300',
  Resource: 'hover:border-stone-300',
}

export function ItemGrid({ items }: ItemGridProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (activeCategory && item.category !== activeCategory) return false
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.subcategory?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [items, activeCategory, search])

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="card-stardew p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stardew-brown/50" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-bold border-2 transition-all',
              activeCategory === null
                ? 'bg-stardew-brown text-stardew-cream border-stardew-brown-dark'
                : 'bg-stardew-cream text-stardew-brown border-stardew-brown/30 hover:border-stardew-brown/60'
            )}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold border-2 transition-all',
                  activeCategory === cat
                    ? 'bg-stardew-brown text-stardew-cream border-stardew-brown-dark'
                    : 'bg-stardew-cream text-stardew-brown border-stardew-brown/30 hover:border-stardew-brown/60'
                )}
              >
                {CATEGORY_EMOJI_MAP[cat] ?? '📦'} {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-stardew-brown/60 font-semibold px-1">
        Showing {filtered.length} of {items.length} items
      </p>

      {/* Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.slug}`}
            className={cn(
              'card-stardew p-3 border-2 border-stardew-brown/20 transition-all hover:shadow-md hover:-translate-y-0.5',
              CATEGORY_CARD_BG[item.category] ?? 'hover:border-stardew-brown/40'
            )}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <StardewItemIcon name={item.name} category={item.category} size={32} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-stardew-brown-dark text-sm leading-tight truncate">{item.name}</p>
                {item.subcategory && (
                  <p className="text-xs text-stardew-brown/60 font-semibold truncate">{item.subcategory}</p>
                )}
                <div className="flex items-center justify-between mt-1.5 gap-1">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full border font-bold',
                    CATEGORY_COLORS[item.category] ?? 'bg-gray-100 border-gray-300 text-gray-700'
                  )}>
                    {item.category}
                  </span>
                  {item.sellPrice != null && (
                    <span className="text-xs font-bold text-stardew-gold whitespace-nowrap">
                      {formatGold(item.sellPrice)}
                    </span>
                  )}
                </div>
                {item.season && (
                  <p className="text-xs text-stardew-brown/50 font-semibold mt-1 truncate">
                    {item.season}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-stardew-brown/50">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-bold">No items found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
