import { prisma } from '@stardew/db'
import { getAuthUserId } from '@stardew/auth'
import { GameChecklist } from '@/components/game-checklist/game-checklist'

const SUBCATEGORY_EMOJIS: Record<string, string> = {
  'Meal': '🍽️',
  'Soup': '🍲',
  'Breakfast': '🍳',
  'Fish Dish': '🐟',
  'Vegetable Dish': '🥗',
  'Baked Good': '🥐',
  'Dessert': '🍰',
  'Drink': '🧃',
  'Snack': '🍿',
  'Side Dish': '🥣',
}

const SUBCATEGORY_ORDER = [
  'Meal',
  'Soup',
  'Breakfast',
  'Fish Dish',
  'Vegetable Dish',
  'Side Dish',
  'Baked Good',
  'Dessert',
  'Snack',
  'Drink',
]

export default async function CookingPage() {
  const items = await prisma.gameItem.findMany({
    where: { category: 'Cooked Food' },
    orderBy: [{ subcategory: 'asc' }, { name: 'asc' }],
  })

  const userId = await getAuthUserId()
  const initialChecked: Record<string, boolean> = {}

  if (userId) {
    const progress = await prisma.userGameProgress.findMany({
      where: { userId, listType: 'cooking' },
    })
    for (const p of progress) {
      if (p.completed) initialChecked[p.itemSlug] = true
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">🍳 Cooking Recipes</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Cook every recipe in Stardew Valley. Required for perfection. Click the checkbox to mark a
          recipe as cooked, or click the name to view details.
        </p>
      </div>
      <GameChecklist
        items={items}
        initialChecked={initialChecked}
        listType="cooking"
        label="Cooking Collection"
        subcategoryEmojis={SUBCATEGORY_EMOJIS}
        subcategoryOrder={SUBCATEGORY_ORDER}
      />
    </div>
  )
}
