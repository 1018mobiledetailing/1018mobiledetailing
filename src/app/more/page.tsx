import Link from 'next/link'
import {
  UtensilsCrossed,
  DollarSign,
  Car,
  Hammer,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { AppShell } from '@/components/AppShell'

const items = [
  {
    href: '/meals',
    label: 'Meal Planner',
    description: 'Plan the week\'s meals',
    icon: UtensilsCrossed,
    accent: 'text-green-600 bg-green-50',
  },
  {
    href: '/bills',
    label: 'Bills',
    description: 'Track bills and payments',
    icon: DollarSign,
    accent: 'text-red-600 bg-red-50',
  },
  {
    href: '/vehicles',
    label: 'Vehicles',
    description: 'Maintenance and key dates',
    icon: Car,
    accent: 'text-orange-600 bg-orange-50',
  },
  {
    href: '/home-projects',
    label: 'Home Projects',
    description: 'Projects, repairs, improvements',
    icon: Hammer,
    accent: 'text-yellow-600 bg-yellow-50',
  },
  {
    href: '/settings',
    label: 'Settings',
    description: 'Family, profile, account',
    icon: Settings,
    accent: 'text-gray-600 bg-gray-100',
  },
]

export default function MorePage() {
  return (
    <AppShell title="More">
      <div className="space-y-2">
        {items.map(({ href, label, description, icon: Icon, accent }) => (
          <Link key={href} href={href} className="block">
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-4 active:scale-98">
              <div className={`${accent} rounded-xl p-2.5 flex-shrink-0`}>
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{description}</div>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  )
}
