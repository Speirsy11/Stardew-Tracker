import { prisma } from '@stardew/db'
import { CropTable } from '@/components/crops/crop-table'

export default async function CropsPage() {
  const crops = await prisma.crop.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">🌱 Best Crops by Season</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Compare crops by profitability. Profit/Day accounts for seed cost and regrowth over a full 28-day season.
          Toggle artisan products to see the keg/preserves jar value.
        </p>
      </div>
      <CropTable crops={crops} />
    </div>
  )
}
