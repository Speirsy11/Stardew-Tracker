'use client'

import { useState, useMemo } from 'react'
import { Npc, FriendshipReward } from '@prisma/client'
import { NpcCard } from './npc-card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type NpcWithRewards = Npc & { friendshipRewards: FriendshipReward[] }

interface FriendshipFiltersProps {
  npcs: NpcWithRewards[]
  initialHearts: Record<number, number>
}

export function FriendshipFilters({ npcs, initialHearts }: FriendshipFiltersProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'romanceable'>('all')

  const filtered = useMemo(() =>
    npcs.filter((npc) => {
      if (filter === 'romanceable' && !npc.isRomanceable) return false
      if (search && !npc.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }),
    [npcs, search, filter]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stardew-brown/50" />
          <Input
            placeholder="Search villagers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'romanceable'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border-2 capitalize transition-all',
                filter === f
                  ? 'bg-stardew-brown text-stardew-cream border-stardew-brown'
                  : 'border-stardew-brown/30 text-stardew-brown hover:bg-stardew-brown/10 bg-white/50'
              )}
            >
              {f === 'romanceable' ? '💘 Romanceable' : '👥 All Villagers'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((npc) => (
          <NpcCard key={npc.id} npc={npc} initialHearts={initialHearts[npc.id] ?? 0} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12 text-stardew-brown font-semibold">
          No villagers match your search.
        </p>
      )}
    </div>
  )
}
