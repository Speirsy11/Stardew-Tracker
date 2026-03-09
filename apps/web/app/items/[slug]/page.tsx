import { prisma } from '@stardew/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatGold } from '@/lib/utils'
import { ArrowLeft, MapPin, Calendar, Tag, ShoppingBag } from 'lucide-react'

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  Fish: '🐟',
  Mineral: '💎',
  Forage: '🌿',
  'Animal Product': '🥚',
  'Artisan Good': '🍷',
  'Cooked Food': '🍳',
  Crop: '🌾',
  Resource: '🪵',
}

const CATEGORY_COLORS: Record<string, string> = {
  Fish: 'bg-blue-100 border-blue-300 text-blue-800',
  Mineral: 'bg-purple-100 border-purple-300 text-purple-800',
  Forage: 'bg-green-100 border-green-300 text-green-800',
  'Animal Product': 'bg-yellow-100 border-yellow-300 text-yellow-800',
  'Artisan Good': 'bg-red-100 border-red-300 text-red-800',
  'Cooked Food': 'bg-orange-100 border-orange-300 text-orange-800',
  Crop: 'bg-lime-100 border-lime-300 text-lime-800',
  Resource: 'bg-stone-100 border-stone-300 text-stone-800',
}

export async function generateStaticParams() {
  const items = await prisma.gameItem.findMany({ select: { slug: true } })
  return items.map((item) => ({ slug: item.slug }))
}

export default async function ItemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const item = await prisma.gameItem.findUnique({
    where: { slug },
  })

  if (!item) notFound()

  // If this item is a crop, fetch the full crop data
  const crop = item.cropName
    ? await prisma.crop.findUnique({ where: { name: item.cropName } })
    : null

  // Check if this item appears in any bundle
  const bundleItems = await prisma.bundleItem.findMany({
    where: { itemName: { equals: item.name, mode: 'insensitive' } },
    include: { bundle: true },
  })

  // Check if this item exists in the shipping list
  const shippingItem = await prisma.shippingItem.findUnique({
    where: { name: item.name },
  })

  const emoji = CATEGORY_EMOJI_MAP[item.category] ?? '📦'
  const colorClass = CATEGORY_COLORS[item.category] ?? 'bg-gray-100 border-gray-300 text-gray-700'

  return (
    <div className="max-w-2xl mx-auto animate-fade-up space-y-4">
      {/* Back link */}
      <Link
        href="/items"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stardew-brown/70 hover:text-stardew-brown transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Items
      </Link>

      {/* Header card */}
      <div className="card-stardew p-6">
        <div className="flex items-start gap-4">
          <span className="text-5xl leading-none">{emoji}</span>
          <div className="flex-1 min-w-0">
            <h1 className="font-pixel text-base text-stardew-brown-dark leading-snug">{item.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border-2 font-bold ${colorClass}`}>
                {item.category}
              </span>
              {item.subcategory && (
                <span className="text-xs px-2 py-0.5 rounded-full border-2 font-bold bg-stardew-cream border-stardew-brown/20 text-stardew-brown">
                  {item.subcategory}
                </span>
              )}
            </div>
            {item.description && (
              <p className="mt-3 text-sm text-stardew-brown font-semibold leading-relaxed italic">
                &ldquo;{item.description}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        {item.sellPrice != null && (
          <div className="card-stardew p-4 flex items-center gap-3">
            <ShoppingBag size={20} className="text-stardew-gold flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-stardew-brown/60 uppercase tracking-wide">Sell Price</p>
              <p className="text-lg font-bold text-stardew-gold">{formatGold(item.sellPrice)}</p>
            </div>
          </div>
        )}
        {item.season && (
          <div className="card-stardew p-4 flex items-center gap-3">
            <Calendar size={20} className="text-stardew-blue flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-stardew-brown/60 uppercase tracking-wide">Season</p>
              <p className="text-sm font-bold text-stardew-brown-dark">{item.season}</p>
            </div>
          </div>
        )}
        {item.location && (
          <div className="card-stardew p-4 flex items-center gap-3 col-span-2">
            <MapPin size={20} className="text-stardew-green flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-stardew-brown/60 uppercase tracking-wide">Location</p>
              <p className="text-sm font-bold text-stardew-brown-dark">{item.location}</p>
            </div>
          </div>
        )}
      </div>

      {/* How to obtain */}
      <div className="card-stardew p-5">
        <h2 className="font-pixel text-xs text-stardew-brown-dark mb-3 flex items-center gap-2">
          <Tag size={14} />
          How to Obtain
        </h2>
        <p className="text-sm text-stardew-brown font-semibold leading-relaxed">
          {item.obtainMethod}
        </p>
      </div>

      {/* Crop details (if this item is a crop) */}
      {crop && (
        <div className="card-stardew p-5">
          <h2 className="font-pixel text-xs text-stardew-brown-dark mb-3 flex items-center gap-2">
            🌱 Crop Details
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-stardew-brown/60 font-bold uppercase tracking-wide">Seasons</p>
              <p className="font-bold text-stardew-brown-dark">{crop.seasons.join(', ')}</p>
            </div>
            <div>
              <p className="text-xs text-stardew-brown/60 font-bold uppercase tracking-wide">Days to Grow</p>
              <p className="font-bold text-stardew-brown-dark">{crop.growDays} days</p>
            </div>
            {crop.regrowDays && (
              <div>
                <p className="text-xs text-stardew-brown/60 font-bold uppercase tracking-wide">Regrows Every</p>
                <p className="font-bold text-stardew-brown-dark">{crop.regrowDays} days</p>
              </div>
            )}
            <div>
              <p className="text-xs text-stardew-brown/60 font-bold uppercase tracking-wide">Seed Cost</p>
              <p className="font-bold text-stardew-gold">{formatGold(crop.buyPrice)}</p>
            </div>
            {crop.artisanProduct && crop.artisanPrice && (
              <div className="col-span-2">
                <p className="text-xs text-stardew-brown/60 font-bold uppercase tracking-wide">Artisan Product</p>
                <p className="font-bold text-stardew-brown-dark">
                  {crop.artisanProduct} — {formatGold(crop.artisanPrice)}
                </p>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-stardew-brown/10">
            <Link
              href="/crops"
              className="text-xs font-bold text-stardew-green hover:text-stardew-brown transition-colors"
            >
              → View all crops &amp; profitability
            </Link>
          </div>
        </div>
      )}

      {/* Shipping prices (if in shipping list) */}
      {shippingItem && (
        <div className="card-stardew p-5">
          <h2 className="font-pixel text-xs text-stardew-brown-dark mb-3">
            📦 Shipping Prices
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: 'Normal', price: shippingItem.basePrice },
              { label: 'Silver ✦', price: shippingItem.silverPrice },
              { label: 'Gold ✦✦', price: shippingItem.goldPrice },
              { label: 'Iridium ✦✦✦', price: shippingItem.iridiumPrice },
            ].map(({ label, price }) =>
              price != null ? (
                <div key={label} className="bg-stardew-cream rounded-lg p-2 border border-stardew-brown/10">
                  <p className="text-stardew-brown/60 font-bold">{label}</p>
                  <p className="font-bold text-stardew-gold mt-0.5">{formatGold(price)}</p>
                </div>
              ) : null
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-stardew-brown/10">
            <Link
              href="/shipping"
              className="text-xs font-bold text-stardew-green hover:text-stardew-brown transition-colors"
            >
              → Track your shipping progress
            </Link>
          </div>
        </div>
      )}

      {/* Bundle appearances */}
      {bundleItems.length > 0 && (
        <div className="card-stardew p-5">
          <h2 className="font-pixel text-xs text-stardew-brown-dark mb-3">
            🏛️ Required in Community Centre
          </h2>
          <div className="space-y-2">
            {bundleItems.map((bi) => (
              <div
                key={bi.id}
                className="flex items-center justify-between text-sm p-2 bg-stardew-cream rounded-lg border border-stardew-brown/10"
              >
                <div>
                  <span className="font-bold text-stardew-brown-dark">{bi.bundle.name}</span>
                  <span className="text-stardew-brown/50 text-xs ml-2">({bi.bundle.room})</span>
                </div>
                <div className="text-right text-xs text-stardew-brown/70 font-semibold">
                  {bi.quantity > 1 && <span>×{bi.quantity} </span>}
                  {bi.quality !== 'Normal' && <span>{bi.quality} quality</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-stardew-brown/10">
            <Link
              href="/community-centre"
              className="text-xs font-bold text-stardew-green hover:text-stardew-brown transition-colors"
            >
              → Track your Community Centre progress
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
