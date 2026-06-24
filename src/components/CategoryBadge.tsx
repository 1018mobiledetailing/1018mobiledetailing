import type { Category } from '@/types/database'

const categoryConfig: Record<Category, { label: string; className: string }> = {
  groceries: { label: 'Groceries', className: 'bg-green-100 text-green-800' },
  bills: { label: 'Bills', className: 'bg-red-100 text-red-800' },
  vehicles: { label: 'Vehicles', className: 'bg-blue-100 text-blue-800' },
  home: { label: 'Home', className: 'bg-orange-100 text-orange-800' },
  school: { label: 'School', className: 'bg-purple-100 text-purple-800' },
  vacation: { label: 'Vacation', className: 'bg-cyan-100 text-cyan-800' },
  medical: { label: 'Medical', className: 'bg-pink-100 text-pink-800' },
  pets: { label: 'Pets', className: 'bg-yellow-100 text-yellow-800' },
  other: { label: 'Other', className: 'bg-gray-100 text-gray-600' },
}

export function CategoryBadge({ category }: { category: Category }) {
  const config = categoryConfig[category] ?? categoryConfig.other
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  )
}

export { categoryConfig }
