'use client'

import { Check } from 'lucide-react'
import type { GroceryItem as GroceryItemType } from '@/types/database'
import { CategoryBadge } from './CategoryBadge'

interface GroceryItemProps {
  item: GroceryItemType
  onToggle: (id: string, completed: boolean) => void
}

export function GroceryItem({ item, onToggle }: GroceryItemProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 ${
        item.completed ? 'opacity-50' : ''
      }`}
    >
      <button
        onClick={() => onToggle(item.id, !item.completed)}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center ${
          item.completed
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-blue-400'
        }`}
        aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {item.completed && <Check size={14} className="text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium text-gray-900 text-sm ${
              item.completed ? 'line-through' : ''
            }`}
          >
            {item.name}
          </span>
          {item.quantity && item.quantity !== '1' && (
            <span className="text-xs text-gray-400">x{item.quantity}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <CategoryBadge category={item.category} />
          {item.assigned_store && (
            <span className="text-xs text-gray-400">{item.assigned_store}</span>
          )}
          {item.needed_by && (
            <span className="text-xs text-gray-400">
              by {new Date(item.needed_by).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      {item.priority === 'high' && !item.completed && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" title="High priority" />
      )}
    </div>
  )
}
