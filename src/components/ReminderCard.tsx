'use client'

import { Check, RefreshCw } from 'lucide-react'
import type { Reminder } from '@/types/database'
import { PriorityBadge } from './PriorityBadge'
import { CategoryBadge } from './CategoryBadge'
import { MemberAvatar } from './FamilyMemberSelector'

interface ReminderCardProps {
  reminder: Reminder
  onToggle: (id: string, completed: boolean) => void
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ReminderCard({ reminder, onToggle }: ReminderCardProps) {
  const isOverdue =
    reminder.due_date &&
    !reminder.completed &&
    new Date(reminder.due_date) < new Date()

  return (
    <div
      className={`bg-white rounded-xl border px-4 py-3 flex items-start gap-3 ${
        isOverdue ? 'border-red-200' : 'border-gray-100'
      } ${reminder.completed ? 'opacity-50' : ''}`}
    >
      <button
        onClick={() => onToggle(reminder.id, !reminder.completed)}
        className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center ${
          reminder.completed
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-blue-400'
        }`}
        aria-label={reminder.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {reminder.completed && (
          <Check size={14} className="text-white" strokeWidth={3} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium text-gray-900 text-sm ${
            reminder.completed ? 'line-through' : ''
          }`}
        >
          {reminder.title}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <PriorityBadge priority={reminder.priority} />
          <CategoryBadge category={reminder.category} />
          {reminder.due_date && (
            <span
              className={`text-xs font-medium ${
                isOverdue ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {formatDate(reminder.due_date)}
            </span>
          )}
          {reminder.repeat_frequency !== 'none' && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <RefreshCw size={11} />
              {reminder.repeat_frequency}
            </span>
          )}
        </div>
        {reminder.notes && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
            {reminder.notes}
          </p>
        )}
      </div>
      {reminder.assigned_member && (
        <MemberAvatar member={reminder.assigned_member} size="sm" />
      )}
    </div>
  )
}
