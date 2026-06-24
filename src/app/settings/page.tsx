'use client'

import { useState, FormEvent } from 'react'
import { Copy, Check, LogOut, UserPlus } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { Modal } from '@/components/Modal'
import { MemberAvatar } from '@/components/FamilyMemberSelector'
import { useAuth } from '@/contexts/AuthContext'
import { useFamily } from '@/contexts/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types/database'

const AVATAR_COLORS = [
  '#2563EB', '#16A34A', '#DC2626', '#9333EA',
  '#EA580C', '#0891B2', '#BE185D', '#65A30D',
]

export default function SettingsPage() {
  const { signOut } = useAuth()
  const { family, members, currentMember, refetch } = useFamily()
  const [copied, setCopied] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)

  const [form, setForm] = useState({
    display_name: '',
    role: 'adult' as Role,
    avatar_color: AVATAR_COLORS[0],
  })
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState(currentMember?.display_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const supabase = createClient()

  function copyInviteCode() {
    if (!family?.invite_code) return
    navigator.clipboard.writeText(family.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleAddMember(e: FormEvent) {
    e.preventDefault()
    if (!family) return
    setSaving(true)

    const { error } = await supabase.from('family_members').insert({
      family_id: family.id,
      user_id: null,
      display_name: form.display_name.trim(),
      role: form.role,
      avatar_color: form.avatar_color,
    })

    if (!error) {
      setShowAddMember(false)
      setForm({ display_name: '', role: 'adult', avatar_color: AVATAR_COLORS[0] })
      refetch()
    }
    setSaving(false)
  }

  async function saveName() {
    if (!currentMember || !editName.trim()) return
    setSavingName(true)
    await supabase
      .from('family_members')
      .update({ display_name: editName.trim() })
      .eq('id', currentMember.id)
    await refetch()
    setSavingName(false)
  }

  return (
    <AppShell title="Settings">
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Your Profile
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {currentMember && (
              <div className="flex items-center gap-3 mb-2">
                <MemberAvatar member={currentMember} size="lg" />
                <div>
                  <div className="font-semibold text-gray-900">
                    {currentMember.display_name}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {currentMember.role}
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveName}
                  disabled={savingName || editName === currentMember?.display_name}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40"
                >
                  {savingName ? '...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Family — {family?.name}
            </h2>
            {currentMember?.role === 'admin' && (
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-1 text-xs text-blue-600 font-medium"
              >
                <UserPlus size={14} />
                Add member
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {members.map((m) => (
              <div key={m.id} className="px-4 py-3 flex items-center gap-3">
                <MemberAvatar member={m} size="md" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {m.display_name}
                    {m.id === currentMember?.id && (
                      <span className="ml-1.5 text-xs text-gray-400">(you)</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{m.role}</div>
                </div>
                {!m.user_id && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    No account
                  </span>
                )}
              </div>
            ))}
          </div>

          {family?.invite_code && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1.5">
                Share this code so others can join your family
              </div>
              <button
                onClick={copyInviteCode}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-full"
              >
                <span className="flex-1 font-mono text-sm font-semibold text-gray-700 uppercase tracking-widest">
                  {family.invite_code}
                </span>
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} className="text-gray-400" />
                )}
              </button>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Account
            </h2>
          </div>
          <div className="p-4">
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-red-700 font-medium text-sm"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </section>
      </div>

      <Modal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Family Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <p className="text-sm text-gray-500">
            Add a placeholder for a family member. They can link their account by
            signing up and using the family invite code.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Jake"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="adult">Adult</option>
              <option value="child">Child</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, avatar_color: color })}
                  className={`w-9 h-9 rounded-full border-2 ${
                    form.avatar_color === color
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Member'}
          </button>
        </form>
      </Modal>
    </AppShell>
  )
}
