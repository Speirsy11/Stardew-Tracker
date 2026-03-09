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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home, emoji: '🏠' },
  { href: '/items', label: 'Items', icon: Package, emoji: '📦' },
  { href: '/shipping', label: 'Shipping', icon: ShoppingBasket, emoji: '🚚' },
  { href: '/community-centre', label: 'Community Centre', icon: Building2, emoji: '🏛️' },
  { href: '/checklists', label: 'Checklists', icon: ListChecks, emoji: '📋' },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays, emoji: '📅' },
  { href: '/friendship', label: 'Friendship', icon: Heart, emoji: '💝' },
  { href: '/crops', label: 'Best Crops', icon: Sprout, emoji: '🌱' },
]

function NavLink({ href, label, icon: Icon, emoji, active }: { href: string; label: string; icon: typeof Home; emoji: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'nav-link group',
        active && 'active'
      )}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span className="font-semibold">{label}</span>
      {active && (
        <span className="ml-auto w-2 h-2 rounded-full bg-stardew-green" />
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

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
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)}
          />
        ))}
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
