'use client'

import { useState, useMemo } from 'react'
import { Crop } from '@prisma/client'
import { cn, formatGold, getProfitPerDay, SEASON_COLORS, SEASON_ICONS } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter'
const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter']

type SortKey = 'name' | 'sellPrice' | 'profitPerDay' | 'artisanPrice' | 'growDays'

interface CropTableProps {
  crops: Crop[]
}

export function CropTable({ crops }: CropTableProps) {
  const [activeSeason, setActiveSeason] = useState<Season>('Spring')
  const [sortKey, setSortKey] = useState<SortKey>('profitPerDay')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [showArtisan, setShowArtisan] = useState(true)

  const seasonCrops = useMemo(() =>
    crops.filter((c) =>
      (c.seasons as string[]).includes(activeSeason) &&
      !c.isForage &&
      (search === '' || c.name.toLowerCase().includes(search.toLowerCase()))
    ),
    [crops, activeSeason, search]
  )

  const sorted = useMemo(() => {
    return [...seasonCrops].sort((a, b) => {
      let va = 0, vb = 0
      if (sortKey === 'name') {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      if (sortKey === 'sellPrice') { va = a.sellPrice; vb = b.sellPrice }
      if (sortKey === 'profitPerDay') { va = getProfitPerDay(a); vb = getProfitPerDay(b) }
      if (sortKey === 'artisanPrice') { va = a.artisanPrice ?? 0; vb = b.artisanPrice ?? 0 }
      if (sortKey === 'growDays') { va = a.growDays; vb = b.growDays }
      return sortDir === 'asc' ? va - vb : vb - va
    })
  }, [seasonCrops, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown size={12} className="opacity-30" />
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-stardew-brown" />
      : <ArrowDown size={12} className="text-stardew-brown" />
  }

  const colors = SEASON_COLORS[activeSeason]

  return (
    <div className="space-y-5">
      {/* Season tabs */}
      <div className="flex gap-2 flex-wrap">
        {SEASONS.map((season) => (
          <button
            key={season}
            onClick={() => setActiveSeason(season)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
              activeSeason === season
                ? `${SEASON_COLORS[season].bg} ${SEASON_COLORS[season].text} ${SEASON_COLORS[season].border}`
                : 'border-transparent text-stardew-brown hover:bg-stardew-brown/10 bg-white/40'
            )}
          >
            {SEASON_ICONS[season]} {season}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stardew-brown/50" />
          <Input
            placeholder="Search crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-stardew-brown cursor-pointer">
          <input
            type="checkbox"
            checked={showArtisan}
            onChange={(e) => setShowArtisan(e.target.checked)}
            className="rounded"
          />
          Show artisan products
        </label>
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((crop, index) => (
          <CropCard key={crop.id} crop={crop} rank={index + 1} showArtisan={showArtisan} activeSeason={activeSeason} />
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="text-center py-12 text-stardew-brown font-semibold">
          No crops found for {activeSeason}.
        </p>
      )}

      {/* Sort controls */}
      <div className="card-stardew p-3 flex items-center gap-2 flex-wrap text-xs text-stardew-brown font-semibold">
        <span>Sort by:</span>
        {(
          [
            ['profitPerDay', 'Profit/Day'],
            ['sellPrice', 'Sell Price'],
            ['artisanPrice', 'Artisan Price'],
            ['growDays', 'Grow Days'],
            ['name', 'Name'],
          ] as [SortKey, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => toggleSort(key)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg border transition-all',
              sortKey === key
                ? 'bg-stardew-brown text-stardew-cream border-stardew-brown'
                : 'border-stardew-brown/30 hover:bg-stardew-brown/10 bg-white/40'
            )}
          >
            {label} <SortIcon k={key} />
          </button>
        ))}
      </div>
    </div>
  )
}

function CropCard({ crop, rank, showArtisan, activeSeason }: { crop: Crop; rank: number; showArtisan: boolean; activeSeason: Season }) {
  const profitPerDay = getProfitPerDay(crop)

  const rankColors = ['text-yellow-600', 'text-gray-500', 'text-amber-600']
  const rankEmojis = ['🥇', '🥈', '🥉']

  return (
    <div className="card-stardew p-4 border-2 border-stardew-brown/15 hover:border-stardew-brown/30 transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        <span className={cn('text-sm font-bold', rankColors[rank - 1] ?? 'text-stardew-brown/40')}>
          {rankEmojis[rank - 1] ?? `#${rank}`}
        </span>
        <div className="flex-1">
          <h3 className="font-pixel text-xs text-stardew-brown-dark">{crop.name}</h3>
          <div className="flex gap-1 mt-1 flex-wrap">
            <Badge variant="default" className="text-xs">{crop.category}</Badge>
            {(crop.seasons as string[]).map((s) => (
              <Badge key={s} variant={s as any}>{SEASON_ICONS[s as Season]} {s}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-white/40 rounded-lg p-2">
          <p className="text-stardew-brown/60 font-semibold">Buy</p>
          <p className="font-bold text-stardew-brown-dark">
            {crop.buyPrice > 0 ? formatGold(crop.buyPrice) : 'Foraged'}
          </p>
        </div>
        <div className="bg-white/40 rounded-lg p-2">
          <p className="text-stardew-brown/60 font-semibold">Sell (base)</p>
          <p className="font-bold text-stardew-brown-dark">{formatGold(crop.sellPrice)}</p>
        </div>
        <div className="bg-white/40 rounded-lg p-2">
          <p className="text-stardew-brown/60 font-semibold">Grow Days</p>
          <p className="font-bold text-stardew-brown-dark">
            {crop.growDays}d {crop.regrowDays ? `(+${crop.regrowDays}d)` : ''}
          </p>
        </div>
        <div className="bg-stardew-green/10 rounded-lg p-2 border border-stardew-green/20">
          <p className="text-stardew-brown/60 font-semibold">Profit/Day</p>
          <p className="font-bold text-green-700">{formatGold(profitPerDay)}</p>
        </div>
      </div>

      {/* Artisan product */}
      {showArtisan && crop.artisanProduct && crop.artisanPrice && (
        <div className="bg-stardew-gold/10 border border-stardew-gold/30 rounded-lg p-2 text-xs">
          <p className="text-stardew-brown/60 font-semibold">🍷 Artisan: {crop.artisanProduct}</p>
          <p className="font-bold text-yellow-800">{formatGold(crop.artisanPrice)}</p>
          <p className="text-stardew-brown/50 font-semibold">
            {crop.artisanPrice > crop.sellPrice ? `+${formatGold(crop.artisanPrice - crop.sellPrice)} vs raw` : ''}
          </p>
        </div>
      )}

      {/* Regrow note */}
      {crop.regrowDays && (
        <p className="mt-2 text-xs text-stardew-brown/60 font-semibold">
          ♻️ Regrows every {crop.regrowDays} days
        </p>
      )}
    </div>
  )
}
