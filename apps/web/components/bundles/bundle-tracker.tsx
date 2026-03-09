'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Bundle, BundleItem } from '@prisma/client'
import { cn, formatGold } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Check, ChevronDown, ChevronUp, Trophy, Star, ExternalLink } from 'lucide-react'

function toItemSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

type BundleWithItems = Bundle & { items: BundleItem[] }

const ROOM_EMOJIS: Record<string, string> = {
  Pantry: '🥕',
  'Crafts Room': '🪵',
  'Fish Tank': '🐟',
  'Boiler Room': '⚒️',
  'Bulletin Board': '📌',
  Vault: '💰',
}

const QUALITY_STARS: Record<string, string> = {
  Normal: '',
  Silver: '🥈',
  Gold: '🥇',
}

interface BundleTrackerProps {
  bundles: BundleWithItems[]
  initialChecked: Record<number, boolean>
}

export function BundleTracker({ bundles, initialChecked }: BundleTrackerProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>(initialChecked)
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({
    Pantry: true,
  })

  const rooms = useMemo(() => [...new Set(bundles.map((b) => b.room))], [bundles])

  const allItemIds = bundles.flatMap((b) => b.items.map((i) => i.id))
  const totalChecked = allItemIds.filter((id) => checked[id]).length

  async function toggleItem(bundleItemId: number, bundleId: number) {
    const newVal = !checked[bundleItemId]
    setChecked((prev) => ({ ...prev, [bundleItemId]: newVal }))
    try {
      await fetch('/api/progress/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleItemId, bundleId, completed: newVal }),
      })
    } catch { /* ignored if not signed in */ }
  }

  function toggleRoom(room: string) {
    setExpandedRooms((prev) => ({ ...prev, [room]: !prev[room] }))
  }

  function isBundleComplete(bundle: BundleWithItems): boolean {
    return bundle.items.every((item) => checked[item.id])
  }

  function isRoomComplete(room: string): boolean {
    return bundles
      .filter((b) => b.room === room)
      .every((b) => isBundleComplete(b))
  }

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="card-stardew p-4">
        <Progress
          value={totalChecked}
          max={allItemIds.length}
          label="Community Centre"
          showPercent
          color="bg-stardew-gold"
        />
        <p className="text-xs text-stardew-brown mt-1 font-semibold">
          {totalChecked} / {allItemIds.length} bundle items collected
        </p>
      </div>

      {/* Rooms */}
      {rooms.map((room) => {
        const roomBundles = bundles.filter((b) => b.room === room)
        const roomItems = roomBundles.flatMap((b) => b.items)
        const roomChecked = roomItems.filter((i) => checked[i.id]).length
        const roomComplete = isRoomComplete(room)
        const isExpanded = expandedRooms[room] ?? false

        return (
          <div
            key={room}
            className={cn(
              'card-stardew overflow-hidden border-2 transition-all',
              roomComplete ? 'border-stardew-gold/50' : 'border-stardew-brown/20'
            )}
          >
            {/* Room header */}
            <button
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-stardew-brown/5 transition-colors"
              onClick={() => toggleRoom(room)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ROOM_EMOJIS[room] ?? '🏛️'}</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="font-pixel text-xs text-stardew-brown-dark">{room}</h2>
                    {roomComplete && (
                      <Trophy size={14} className="text-stardew-gold" />
                    )}
                  </div>
                  <p className="text-xs text-stardew-brown font-semibold mt-0.5">
                    {roomChecked}/{roomItems.length} items · {roomBundles.filter((b) => isBundleComplete(b)).length}/{roomBundles.length} bundles
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 hidden sm:block">
                  <Progress value={roomChecked} max={roomItems.length} color={roomComplete ? 'bg-stardew-gold' : 'bg-stardew-green'} />
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-stardew-brown" /> : <ChevronDown size={16} className="text-stardew-brown" />}
              </div>
            </button>

            {/* Bundles */}
            {isExpanded && (
              <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4 border-t border-stardew-brown/10 pt-4">
                {roomBundles.map((bundle) => {
                  const bundleChecked = bundle.items.filter((i) => checked[i.id]).length
                  const bundleComplete = isBundleComplete(bundle)
                  return (
                    <div
                      key={bundle.id}
                      className={cn(
                        'rounded-xl border-2 overflow-hidden transition-all',
                        bundleComplete
                          ? 'border-stardew-gold/60 bg-stardew-gold/5'
                          : 'border-stardew-brown/20 bg-white/30'
                      )}
                    >
                      {/* Bundle header */}
                      <div
                        className="px-3 py-2 flex items-center justify-between"
                        style={{ backgroundColor: bundle.color ? `${bundle.color}22` : undefined }}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-sm text-stardew-brown-dark">{bundle.name}</h3>
                            {bundleComplete && <Star size={12} className="text-stardew-gold fill-current" />}
                          </div>
                          <p className="text-xs text-stardew-brown/70 font-semibold">
                            Reward: {bundle.reward}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-stardew-brown">
                          {bundleChecked}/{bundle.items.length}
                        </span>
                      </div>

                      {/* Bundle items */}
                      <div className="divide-y divide-stardew-brown/5">
                        {bundle.items.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'px-3 py-2 flex items-center gap-2 group hover:bg-stardew-brown/5 transition-colors',
                              checked[item.id] && 'bg-stardew-green/10'
                            )}
                          >
                            <button
                              onClick={() => toggleItem(item.id, bundle.id)}
                              className="flex-shrink-0"
                              aria-label={checked[item.id] ? 'Uncheck' : 'Check'}
                            >
                              <div className={cn('stardew-checkbox', checked[item.id] && 'checked')}>
                                {checked[item.id] && <Check size={10} className="text-white" strokeWidth={3} />}
                              </div>
                            </button>
                            <Link
                              href={`/items/${toItemSlug(item.itemName)}`}
                              className={cn(
                                'text-sm font-semibold flex-1 flex items-center gap-1 min-w-0 hover:underline',
                                checked[item.id] ? 'line-through text-stardew-brown/40' : 'text-stardew-brown-dark'
                              )}
                            >
                              {item.quantity > 1 && <span className="text-stardew-brown/60 mr-1">×{item.quantity}</span>}
                              <span className="truncate">{item.itemName}</span>
                              {QUALITY_STARS[item.quality] && (
                                <span className="ml-1">{QUALITY_STARS[item.quality]}</span>
                              )}
                              <ExternalLink size={10} className="flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
