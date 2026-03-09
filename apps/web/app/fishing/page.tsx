import { prisma } from '@stardew/db'
import { getAuthUserId } from '@stardew/auth'
import { GameChecklist } from '@/components/game-checklist/game-checklist'

const SUBCATEGORY_EMOJIS: Record<string, string> = {
  'Ocean Fish': '🌊',
  'River Fish': '🏞️',
  'Lake Fish': '🏔️',
  'Legendary Fish': '⭐',
  'Legendary Fish II': '🌟',
  'Island Fish': '🏝️',
  'Desert Fish': '🏜️',
  'Night Market Fish': '🌙',
  'Mine Fish': '⛏️',
  'Crab Pot': '🦀',
  'Special Fish': '✨',
  'Other Catchable': '🪣',
  'Wiki Supplemental': '📖',
}

const SUBCATEGORY_ORDER = [
  'Ocean Fish',
  'River Fish',
  'Lake Fish',
  'Island Fish',
  'Desert Fish',
  'Mine Fish',
  'Night Market Fish',
  'Crab Pot',
  'Legendary Fish',
  'Legendary Fish II',
  'Special Fish',
  'Other Catchable',
  'Wiki Supplemental',
]

export default async function FishingPage() {
  const fish = await prisma.gameItem.findMany({
    where: { category: 'Fish' },
    orderBy: [{ subcategory: 'asc' }, { name: 'asc' }],
  })

  const userId = await getAuthUserId()
  const initialChecked: Record<string, boolean> = {}

  if (userId) {
    const progress = await prisma.userGameProgress.findMany({
      where: { userId, listType: 'fishing' },
    })
    for (const p of progress) {
      if (p.completed) initialChecked[p.itemSlug] = true
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">🎣 Fishing</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Catch every fish in Stardew Valley. Required for perfection. Click the checkbox to mark a
          fish as caught, or click the name to view details.
        </p>
      </div>
      <GameChecklist
        items={fish}
        initialChecked={initialChecked}
        listType="fishing"
        label="Fishing Collection"
        subcategoryEmojis={SUBCATEGORY_EMOJIS}
        subcategoryOrder={SUBCATEGORY_ORDER}
      />
    </div>
  )
}
