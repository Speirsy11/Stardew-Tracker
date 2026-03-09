import { prisma } from '@stardew/db'
import { ItemGrid } from '@/components/items/item-grid'

export default async function ItemsPage() {
  const items = await prisma.gameItem.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  return (
    <div className="max-w-7xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">📦 Items Encyclopedia</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Every item in Stardew Valley — click any item to see how to obtain it, its sell price, and more.
        </p>
      </div>
      <ItemGrid items={items} />
    </div>
  )
}
