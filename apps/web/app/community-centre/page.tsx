import { prisma } from '@stardew/db'
import { BundleTracker } from '@/components/bundles/bundle-tracker'

export default async function CommunityCentrePage() {
  const bundles = await prisma.bundle.findMany({
    include: {
      items: { orderBy: { id: 'asc' } },
    },
    orderBy: { id: 'asc' },
  })

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">🏛️ Community Centre</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Complete all bundles in the Community Centre to restore it and unlock rewards.
          Click any item to check it off, and click a room header to expand it.
        </p>
      </div>
      <BundleTracker bundles={bundles} initialChecked={{}} />
    </div>
  )
}
