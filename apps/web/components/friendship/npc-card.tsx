'use client'

import { useState } from 'react'
import { Npc, FriendshipReward } from '@prisma/client'
import { cn, formatGold, SEASON_COLORS, SEASON_ICONS } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Heart, ChevronDown, ChevronUp, Gift, Star } from 'lucide-react'

type NpcWithRewards = Npc & { friendshipRewards: FriendshipReward[] }

interface NpcCardProps {
  npc: NpcWithRewards
  initialHearts: number
}

const MAX_HEARTS = 10
const ROMANCEABLE_MAX = 14

function HeartDisplay({ current, max, onChange }: { current: number; max: number; onChange: (h: number) => void }) {
  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: max }, (_, i) => i + 1).map((h) => (
        <button
          key={h}
          onClick={() => onChange(h === current ? 0 : h)}
          className="transition-transform hover:scale-110"
          title={`${h} heart${h > 1 ? 's' : ''}`}
        >
          <Heart
            size={14}
            className={cn(
              'transition-colors',
              h <= current ? 'fill-stardew-pink text-stardew-pink' : 'text-stardew-brown/20 fill-none'
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function NpcCard({ npc, initialHearts }: NpcCardProps) {
  const [hearts, setHearts] = useState(initialHearts)
  const [expanded, setExpanded] = useState(false)
  const maxHearts = npc.isRomanceable ? ROMANCEABLE_MAX : MAX_HEARTS

  async function updateHearts(h: number) {
    setHearts(h)
    try {
      await fetch('/api/progress/friendship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npcId: npc.id, hearts: h }),
      })
    } catch { /* ignored if not logged in */ }
  }

  const nextMilestone = npc.friendshipRewards
    .filter((r) => r.hearts > hearts)
    .sort((a, b) => a.hearts - b.hearts)[0]

  return (
    <div className={cn(
      'card-stardew overflow-hidden border-2 transition-all',
      hearts >= maxHearts ? 'border-stardew-pink/50' : 'border-stardew-brown/20'
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border-2',
            SEASON_COLORS[npc.birthdaySeason as keyof typeof SEASON_COLORS].bg,
            SEASON_COLORS[npc.birthdaySeason as keyof typeof SEASON_COLORS].border
          )}>
            {npc.isRomanceable ? '💘' : '😊'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-pixel text-xs text-stardew-brown-dark">{npc.name}</h3>
              {npc.isRomanceable && (
                <Badge variant="default" className="text-pink-600 bg-pink-50 border-pink-200">💘</Badge>
              )}
            </div>
            <Badge variant={npc.birthdaySeason as any} className="mb-2">
              {SEASON_ICONS[npc.birthdaySeason as keyof typeof SEASON_ICONS]} {npc.birthdaySeason} {npc.birthdayDay}
            </Badge>
            <HeartDisplay current={hearts} max={maxHearts} onChange={updateHearts} />
          </div>
        </div>

        {/* Next milestone hint */}
        {nextMilestone && hearts > 0 && (
          <div className="mt-3 text-xs text-stardew-brown/70 font-semibold bg-stardew-brown/5 rounded-lg px-3 py-2">
            Next at {nextMilestone.hearts}♥: {nextMilestone.reward}
          </div>
        )}
      </div>

      {/* Expand toggle */}
      <button
        className="w-full px-4 py-2 flex items-center justify-between bg-stardew-brown/5 hover:bg-stardew-brown/10 transition-colors border-t border-stardew-brown/10 text-xs font-semibold text-stardew-brown"
        onClick={() => setExpanded(!expanded)}
      >
        <span>Gifts & Rewards</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="p-4 space-y-4 border-t border-stardew-brown/10 animate-fade-up">
          {/* Loved gifts */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Star size={13} className="text-stardew-gold fill-current" />
              <h4 className="text-xs font-pixel text-stardew-brown-dark">Loved</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {npc.lovedGifts.map((gift) => (
                <span
                  key={gift}
                  className="px-2 py-0.5 bg-stardew-gold/20 border border-stardew-gold/40 rounded-full text-xs font-semibold text-yellow-800"
                >
                  {gift}
                </span>
              ))}
            </div>
          </div>

          {/* Liked gifts */}
          {npc.likedGifts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Gift size={13} className="text-stardew-green" />
                <h4 className="text-xs font-pixel text-stardew-brown-dark">Liked</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {npc.likedGifts.map((gift) => (
                  <span
                    key={gift}
                    className="px-2 py-0.5 bg-stardew-green/10 border border-stardew-green/30 rounded-full text-xs font-semibold text-green-800"
                  >
                    {gift}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hated gifts */}
          {npc.hatedGifts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">⚠️</span>
                <h4 className="text-xs font-pixel text-stardew-brown-dark">Hated</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {npc.hatedGifts.map((gift) => (
                  <span
                    key={gift}
                    className="px-2 py-0.5 bg-red-50 border border-red-200 rounded-full text-xs font-semibold text-red-700"
                  >
                    {gift}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Heart milestones */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Heart size={13} className="text-stardew-pink fill-current" />
              <h4 className="text-xs font-pixel text-stardew-brown-dark">Heart Milestones</h4>
            </div>
            <div className="space-y-1.5">
              {npc.friendshipRewards
                .sort((a, b) => a.hearts - b.hearts)
                .map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      'flex items-start gap-2 text-xs px-3 py-2 rounded-lg',
                      hearts >= r.hearts
                        ? 'bg-stardew-pink/10 text-stardew-brown-dark'
                        : 'bg-stardew-brown/5 text-stardew-brown/60'
                    )}
                  >
                    <span className="font-semibold flex-shrink-0 text-stardew-pink">
                      {r.hearts}♥
                    </span>
                    <span className={cn('font-semibold', hearts >= r.hearts && 'line-through opacity-60')}>{r.reward}</span>
                    {hearts >= r.hearts && <span className="ml-auto text-stardew-green text-base leading-none">✓</span>}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
