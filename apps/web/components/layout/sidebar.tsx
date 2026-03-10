'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  ShoppingBasket,
  Home,
  Building2,
  ListChecks,
  CalendarDays,
  Heart,
  Sprout,
  Package,
  Menu,
  X,
  LogIn,
  LogOut,
  Fish,
  Landmark,
  UtensilsCrossed,
  Hammer,
  Palette,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type NavItem = {
  href: string
  label: string
  icon: typeof Home
  emoji: string
}

const checklistItems: NavItem[] = [
  { href: '/shipping', label: 'Shipping', icon: ShoppingBasket, emoji: '🚚' },
  { href: '/community-centre', label: 'Community Centre', icon: Building2, emoji: '🏛️' },
  { href: '/fishing', label: 'Fishing', icon: Fish, emoji: '🎣' },
  { href: '/museum', label: 'Museum', icon: Landmark, emoji: '🏺' },
  { href: '/cooking', label: 'Cooking', icon: UtensilsCrossed, emoji: '🍳' },
  { href: '/crafting', label: 'Crafting', icon: Hammer, emoji: '🔨' },
  { href: '/checklists', label: 'Custom', icon: ListChecks, emoji: '📋' },
]

const referenceItems: NavItem[] = [
  { href: '/items', label: 'Items', icon: Package, emoji: '📦' },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays, emoji: '📅' },
  { href: '/friendship', label: 'Friendship', icon: Heart, emoji: '💝' },
  { href: '/crops', label: 'Best Crops', icon: Sprout, emoji: '🌱' },
]

const toolItems: NavItem[] = [
  { href: '/pixel-art', label: 'Pixel Art', icon: Palette, emoji: '🎨' },
]

function NavLink({ href, label, emoji, active }: { href: string; label: string; emoji: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn('nav-link group', active && 'active')}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span className="font-semibold">{label}</span>
      {active && <span className="ml-auto w-2 h-2 rounded-full bg-stardew-green" />}
    </Link>
  )
}

function NavGroup({
  label,
  emoji,
  items,
  pathname,
  defaultOpen,
}: {
  label: string
  emoji: string
  items: NavItem[]
  pathname: string
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-stardew-brown hover:bg-stardew-brown/5 transition-colors mb-0.5"
      >
        <span className="text-sm leading-none">{emoji}</span>
        <span className="text-xs font-pixel text-stardew-brown/70 uppercase tracking-wide flex-1 text-left">
          {label}
        </span>
        {open
          ? <ChevronDown size={12} className="text-stardew-brown/50" />
          : <ChevronRight size={12} className="text-stardew-brown/50" />}
      </button>

      {open && (
        <div className="pl-2 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const checklistActive = checklistItems.some((i) => pathname.startsWith(i.href))
  const referenceActive = referenceItems.some((i) => pathname.startsWith(i.href))
  const toolsActive = toolItems.some((i) => pathname.startsWith(i.href))

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b-2 border-stardew-brown/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌾</span>
          <div>
            <h1 className="font-pixel text-xs text-stardew-brown-dark leading-tight">Stardew</h1>
            <p className="font-pixel text-xs text-stardew-brown leading-tight">Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
        {/* Dashboard — standalone */}
        <NavLink href="/" label="Dashboard" emoji="🏠" active={pathname === '/'} />

        {/* Checklists group */}
        <NavGroup
          label="Checklists"
          emoji="✅"
          items={checklistItems}
          pathname={pathname}
          defaultOpen={checklistActive || pathname === '/'}
        />

        {/* Reference group */}
        <NavGroup
          label="Reference"
          emoji="📖"
          items={referenceItems}
          pathname={pathname}
          defaultOpen={referenceActive}
        />

        {/* Tools group */}
        <NavGroup
          label="Tools"
          emoji="🛠️"
          items={toolItems}
          pathname={pathname}
          defaultOpen={toolsActive}
        />
      </nav>

      {/* Auth */}
      <div className="px-3 py-3 border-t-2 border-stardew-brown/10">
        {status === 'loading' ? (
          <div className="text-xs text-stardew-brown/50 text-center font-semibold py-2">...</div>
        ) : session?.user ? (
          <div className="space-y-2">
            <div className="text-xs text-stardew-brown-dark font-semibold truncate px-1">
              🧑‍🌾 {session.user.name || session.user.email}
            </div>
            <button
              onClick={() => signOut()}
              className="nav-link group w-full text-left"
            >
              <LogOut size={14} />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        ) : (
          <Link href="/auth/signin" className={cn('nav-link group', pathname === '/auth/signin' && 'active')}>
            <LogIn size={14} />
            <span className="font-semibold">Sign In</span>
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t-2 border-stardew-brown/10">
        <p className="text-xs text-stardew-brown/60 text-center font-semibold">
          Stardew Valley v1.6
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 h-screen sticky top-0 card-stardew border-r-2 border-stardew-brown/20 shadow-lg flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 card-stardew rounded-xl shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 card-stardew shadow-2xl">
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )
}
