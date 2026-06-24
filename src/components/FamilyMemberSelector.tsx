'use client'

import type { FamilyMember } from '@/types/database'

interface FamilyMemberSelectorProps {
  members: FamilyMember[]
  value: string
  onChange: (memberId: string) => void
  label?: string
  includeNone?: boolean
}

export function FamilyMemberSelector({
  members,
  value,
  onChange,
  label = 'Assign to',
  includeNone = true,
}: FamilyMemberSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {includeNone && <option value="">Anyone</option>}
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.display_name}
            {m.role === 'child' ? ' (child)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

export function MemberAvatar({
  member,
  size = 'md',
}: {
  member: FamilyMember
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size]

  const initials = member.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      style={{ backgroundColor: member.avatar_color }}
      title={member.display_name}
    >
      {initials}
    </div>
  )
}
