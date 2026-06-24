import type { Priority } from '@/types/database'

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-800' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority] ?? priorityConfig.medium
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  )
}
