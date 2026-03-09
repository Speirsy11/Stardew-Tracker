import { prisma } from '@stardew/db'
import { getAuthUserId } from '@stardew/auth'
import { ShippingGrid } from '@/components/shipping/shipping-grid'

export default async function ShippingPage() {
  const items = await prisma.shippingItem.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  const userId = await getAuthUserId()
  const initialChecked: Record<number, boolean> = {}

  if (userId) {
    const progress = await prisma.userShipping.findMany({ where: { userId } })
    for (const p of progress) {
      if (p.shipped) initialChecked[p.itemId] = true
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">📦 Shipping Collection</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Check off every item you&apos;ve shipped at least once to complete the Shipping collection.
          Prices shown are base quality · silver · gold · iridium.
        </p>
      </div>
      <ShippingGrid items={items} initialChecked={initialChecked} />
    </div>
  )
}

