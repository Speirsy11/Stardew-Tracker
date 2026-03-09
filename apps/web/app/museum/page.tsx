import { prisma } from '@stardew/db'
import { getAuthUserId } from '@stardew/auth'
import { GameChecklist } from '@/components/game-checklist/game-checklist'

const SUBCATEGORY_EMOJIS: Record<string, string> = {
  'Museum Artifact': '🏺',
  'Field Office Donation': '🗺️',
  'Gem': '💎',
  'Geode Mineral': '🪨',
  'Metal Bar': '🔩',
  'Ore': '⛏️',
  'Refined': '✨',
}

const SUBCATEGORY_ORDER = [
  'Museum Artifact',
  'Field Office Donation',
  'Gem',
  'Geode Mineral',
  'Ore',
  'Metal Bar',
  'Refined',
]

export default async function MuseumPage() {
  const items = await prisma.gameItem.findMany({
    where: { category: { in: ['Artifact', 'Mineral'] } },
    orderBy: [{ category: 'asc' }, { subcategory: 'asc' }, { name: 'asc' }],
  })

  const userId = await getAuthUserId()
  const initialChecked: Record<string, boolean> = {}

  if (userId) {
    const progress = await prisma.userGameProgress.findMany({
      where: { userId, listType: 'museum' },
    })
    for (const p of progress) {
      if (p.completed) initialChecked[p.itemSlug] = true
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">🏛️ Museum & Donations</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Donate all artifacts and minerals to the Museum. Required for perfection. Click the
          checkbox to mark an item as donated, or click the name to view details.
        </p>
      </div>
      <GameChecklist
        items={items}
        initialChecked={initialChecked}
        listType="museum"
        label="Museum Collection"
        subcategoryEmojis={SUBCATEGORY_EMOJIS}
        subcategoryOrder={SUBCATEGORY_ORDER}
      />
    </div>
  )
}
