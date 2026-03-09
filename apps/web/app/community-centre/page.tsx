import { prisma } from '@stardew/db'
import { getAuthUserId } from '@stardew/auth'
import { BundleTracker } from '@/components/bundles/bundle-tracker'

export default async function CommunityCentrePage() {
  const bundles = await prisma.bundle.findMany({
    include: {
      items: { orderBy: { id: 'asc' } },
    },
    orderBy: { id: 'asc' },
  })

  const userId = await getAuthUserId()
  const initialChecked: Record<number, boolean> = {}

  if (userId) {
    const progress = await prisma.userBundle.findMany({ where: { userId } })
    for (const p of progress) {
      if (p.completed) initialChecked[p.bundleItemId] = true
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">🏛️ Community Centre</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Complete all bundles in the Community Centre to restore it and unlock rewards.
          Click any item to check it off, and click a room header to expand it.
        </p>
      </div>
      <BundleTracker bundles={bundles} initialChecked={initialChecked} />
    </div>
  )
}

