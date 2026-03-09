import { prisma } from '@stardew/db'
import { formatGold } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

async function getStats() {
  const [totalShipping, totalBundles, totalBundleItems, totalNpcs] = await Promise.all([
    prisma.shippingItem.count(),
    prisma.bundle.count(),
    prisma.bundleItem.count(),
    prisma.npc.count(),
  ])
  return { totalShipping, totalBundles, totalBundleItems, totalNpcs }
}

const features = [
  {
    href: '/shipping',
    emoji: '📦',
    title: 'Shipping',
    description: 'Track all crops, forage, fish and artisan goods shipped.',
    color: 'border-stardew-green/40 hover:bg-stardew-green/5',
  },
  {
    href: '/community-centre',
    emoji: '🏛️',
    title: 'Community Centre',
    description: 'Complete bundles in every room of the Community Centre.',
    color: 'border-stardew-gold/40 hover:bg-stardew-gold/5',
  },
  {
    href: '/checklists',
    emoji: '📋',
    title: 'Custom Checklists',
    description: 'Upload a Markdown file and turn it into a GUI checklist.',
    color: 'border-stardew-blue/40 hover:bg-stardew-blue/5',
  },
  {
    href: '/calendar',
    emoji: '📅',
    title: 'Calendar',
    description: 'All birthdays & festivals. Enter the current date to see upcoming events.',
    color: 'border-stardew-pink/40 hover:bg-stardew-pink/5',
  },
  {
    href: '/friendship',
    emoji: '💝',
    title: 'Friendship',
    description: 'Best gifts for every villager and what you unlock at each heart level.',
    color: 'border-stardew-pink/40 hover:bg-stardew-pink/5',
  },
  {
    href: '/crops',
    emoji: '🌱',
    title: 'Best Crops',
    description: 'Best crops to grow each season with profit, artisan prices and more.',
    color: 'border-fall/40 hover:bg-fall/5',
  },
]

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      {/* Hero */}
      <div className="mb-8 card-stardew p-6 flex items-center gap-6">
        <div className="text-6xl">🌾</div>
        <div>
          <h1 className="font-pixel text-xl text-stardew-brown-dark mb-2">Stardew Tracker</h1>
          <p className="text-stardew-brown font-semibold text-sm">
            Your companion for completing Stardew Valley. Track shipping, bundles,
            friendship, crops, events, and more — all in one place.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard emoji="📦" label="Shipping Items" value={stats.totalShipping} />
        <StatCard emoji="🏛️" label="Bundles" value={stats.totalBundles} />
        <StatCard emoji="📦" label="Bundle Items" value={stats.totalBundleItems} />
        <StatCard emoji="💝" label="Villagers" value={stats.totalNpcs} />
      </div>

      {/* Feature cards */}
      <h2 className="font-pixel text-sm text-stardew-brown mb-4">Features</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`card-stardew p-5 border-2 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg ${f.color} group`}
          >
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h3 className="font-pixel text-xs text-stardew-brown-dark mb-2 group-hover:text-stardew-brown">
              {f.title}
            </h3>
            <p className="text-xs text-stardew-brown/80 font-semibold leading-relaxed">
              {f.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-8 card-stardew p-4 flex gap-3 border-l-4 border-stardew-gold">
        <span className="text-2xl">💡</span>
        <div>
          <p className="font-pixel text-xs text-stardew-brown-dark mb-1">Getting Started</p>
          <p className="text-xs text-stardew-brown font-semibold leading-relaxed">
            Sign in to save your progress across devices. Without an account, use the
            checklists feature to upload your own .md files and track them locally.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: number }) {
  return (
    <div className="card-stardew p-4 text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="font-pixel text-lg text-stardew-brown-dark">{value}</div>
      <div className="text-xs text-stardew-brown font-semibold mt-0.5">{label}</div>
    </div>
  )
}
