'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { GameItem } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Check, ChevronDown, ChevronUp, Search, Trophy, ExternalLink } from 'lucide-react'

interface GameChecklistProps {
  items: GameItem[]
  initialChecked: Record<string, boolean>
  listType: string
  label: string
  subcategoryEmojis?: Record<string, string>
  subcategoryOrder?: string[]
}

export function GameChecklist({
  items,
  initialChecked,
  listType,
  label,
  subcategoryEmojis = {},
  subcategoryOrder = [],
}: GameChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>(initialChecked)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const [hideCompleted, setHideCompleted] = useState(false)

  const subcategories = useMemo(() => {
    const all = [...new Set(items.map((i) => i.subcategory ?? 'Other'))]
    if (subcategoryOrder.length > 0) {
      const ordered = subcategoryOrder.filter((s) => all.includes(s))
      const rest = all.filter((s) => !subcategoryOrder.includes(s)).sort()
      return [...ordered, ...rest]
    }
    return all.sort()
  }, [items, subcategoryOrder])

  const filtered = useMemo(() => {
    if (!search && !hideCompleted) return items
    return items.filter((item) => {
      if (hideCompleted && checked[item.slug]) return false
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [items, checked, search, hideCompleted])

  const grouped = useMemo(() => {
    const groups: Record<string, GameItem[]> = {}
    for (const item of filtered) {
      const key = item.subcategory ?? 'Other'
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }, [filtered])

  const totalChecked = items.filter((i) => checked[i.slug]).length

  async function toggleItem(slug: string) {
    const newVal = !checked[slug]
    setChecked((prev) => ({ ...prev, [slug]: newVal }))
    try {
      await fetch('/api/progress/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemSlug: slug, listType, completed: newVal }),
      })
    } catch { /* ignored if not signed in */ }
  }

  function toggleSection(subcat: string) {
    setExpandedSections((prev) => ({ ...prev, [subcat]: !prev[subcat] }))
  }

  const visibleSubcategories = subcategories.filter((s) => grouped[s]?.length > 0)

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="card-stardew p-4">
        <Progress
          value={totalChecked}
          max={items.length}
          label={label}
          showPercent
          color="bg-stardew-blue"
        />
        <p className="text-xs text-stardew-brown mt-1 font-semibold">
          {totalChecked} / {items.length} items completed
        </p>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stardew-brown/50" />
          <Input
            placeholder="Search..."
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

      {/* Subcategory sections */}
      {visibleSubcategories.map((subcat) => {
        const subcatItems = grouped[subcat] ?? []
        const subcatChecked = subcatItems.filter((i) => checked[i.slug]).length
        const isComplete = subcatChecked === subcatItems.length && subcatItems.length > 0
        const isExpanded = expandedSections[subcat] ?? false
        const emoji = subcategoryEmojis[subcat] ?? '📦'

        return (
          <div
            key={subcat}
            className={cn(
              'card-stardew overflow-hidden border-2 transition-all',
              isComplete ? 'border-stardew-gold/50' : 'border-stardew-brown/20'
            )}
          >
            <button
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-stardew-brown/5 transition-colors"
              onClick={() => toggleSection(subcat)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="font-pixel text-xs text-stardew-brown-dark">{subcat}</h2>
                    {isComplete && <Trophy size={14} className="text-stardew-gold" />}
                  </div>
                  <p className="text-xs text-stardew-brown font-semibold mt-0.5">
                    {subcatChecked} / {subcatItems.length} collected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 hidden sm:block">
                  <Progress
                    value={subcatChecked}
                    max={subcatItems.length}
                    color={isComplete ? 'bg-stardew-gold' : 'bg-stardew-blue'}
                  />
                </div>
                {isExpanded
                  ? <ChevronUp size={16} className="text-stardew-brown" />
                  : <ChevronDown size={16} className="text-stardew-brown" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-stardew-brown/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stardew-brown/5">
                  {subcatItems.map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      isChecked={!!checked[item.slug]}
                      onToggle={() => toggleItem(item.slug)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {visibleSubcategories.length === 0 && (
        <div className="text-center py-12 text-stardew-brown font-semibold">
          No items match your filters.
        </div>
      )}
    </div>
  )
}

function ChecklistItemRow({
  item,
  isChecked,
  onToggle,
}: {
  item: GameItem
  isChecked: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'bg-white/40 p-3 flex items-center gap-2 group transition-all duration-100',
        isChecked && 'bg-stardew-green/10'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="flex-shrink-0"
        aria-label={isChecked ? 'Uncheck' : 'Check'}
      >
        <div className={cn('stardew-checkbox', isChecked && 'checked')}>
          {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
        </div>
      </button>

      {/* Item name as link */}
      <Link
        href={`/items/${item.slug}`}
        className={cn(
          'flex-1 text-sm font-semibold flex items-center gap-1 min-w-0 hover:underline',
          isChecked ? 'line-through text-stardew-brown/40' : 'text-stardew-brown-dark'
        )}
      >
        <span className="truncate">{item.name}</span>
        <ExternalLink size={10} className="flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
      </Link>
    </div>
  )
}
