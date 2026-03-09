import { prisma } from '@stardew/db'
import { NpcCard } from '@/components/friendship/npc-card'
import { FriendshipFilters } from '@/components/friendship/friendship-filters'

export default async function FriendshipPage() {
  const npcs = await prisma.npc.findMany({
    include: { friendshipRewards: { orderBy: { hearts: 'asc' } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">💝 Friendship</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Track your hearts with every villager. See their loved gifts and what
          you unlock at each friendship milestone. Click the hearts to set your level.
        </p>
      </div>
      <FriendshipFilters npcs={npcs} />
    </div>
  )
}
