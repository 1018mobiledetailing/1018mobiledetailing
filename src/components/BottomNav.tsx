'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Bell,
  FolderOpen,
  LayoutGrid,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/groceries', label: 'Groceries', icon: ShoppingCart },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/uploads', label: 'Uploads', icon: FolderOpen },
  { href: '/more', label: 'More', icon: LayoutGrid },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
      <div className="max-w-lg mx-auto flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-xs font-medium transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
