import { prisma } from '@stardew/db'
import { getAuthUserId } from '@stardew/auth'
import { GameChecklist } from '@/components/game-checklist/game-checklist'

const SUBCATEGORY_EMOJIS: Record<string, string> = {
  'Craftable': '🔨',
  'Fences': '🪵',
  'Lighting': '💡',
  'Warp Totem': '🪄',
}

const SUBCATEGORY_ORDER = [
  'Craftable',
  'Fences',
  'Lighting',
  'Warp Totem',
]

export default async function CraftingPage() {
  const items = await prisma.gameItem.findMany({
    where: { category: 'Craftable Item' },
    orderBy: [{ subcategory: 'asc' }, { name: 'asc' }],
  })

  const userId = await getAuthUserId()
  const initialChecked: Record<string, boolean> = {}

  if (userId) {
    const progress = await prisma.userGameProgress.findMany({
      where: { userId, listType: 'crafting' },
    })
    for (const p of progress) {
      if (p.completed) initialChecked[p.itemSlug] = true
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">🔨 Crafting Recipes</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Craft every item in Stardew Valley. Required for perfection. Click the checkbox to mark an
          item as crafted, or click the name to view details.
        </p>
      </div>
      <GameChecklist
        items={items}
        initialChecked={initialChecked}
        listType="crafting"
        label="Crafting Collection"
        subcategoryEmojis={SUBCATEGORY_EMOJIS}
        subcategoryOrder={SUBCATEGORY_ORDER}
      />
    </div>
  )
}
