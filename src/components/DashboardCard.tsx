import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle?: string
  href: string
  icon: LucideIcon
  accent?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'
}

const accentMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-100',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    border: 'border-yellow-100',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-100',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-100',
  },
}

export function DashboardCard({
  title,
  value,
  subtitle,
  href,
  icon: Icon,
  accent = 'blue',
}: DashboardCardProps) {
  const colors = accentMap[accent]

  return (
    <Link href={href} className="block">
      <div
        className={`bg-white rounded-2xl border ${colors.border} p-4 active:scale-98 flex items-center gap-4`}
      >
        <div className={`${colors.bg} rounded-xl p-3 flex-shrink-0`}>
          <Icon size={24} className={colors.icon} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold text-gray-900 leading-none mb-0.5">
            {value}
          </div>
          <div className="text-sm font-medium text-gray-700">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</div>
          )}
        </div>
        <svg
          className="text-gray-300 flex-shrink-0"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            d="M6 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  )
}
