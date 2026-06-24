'use client'

import { useState, useEffect, FormEvent } from 'react'
import { AppShell } from '@/components/AppShell'
import { ReminderCard } from '@/components/ReminderCard'
import { AddButton } from '@/components/AddButton'
import { Modal } from '@/components/Modal'
import { FamilyMemberSelector } from '@/components/FamilyMemberSelector'
import { useFamily } from '@/contexts/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import type { Reminder, Category, Priority, RepeatFrequency } from '@/types/database'

const CATEGORIES: Category[] = [
  'groceries', 'bills', 'vehicles', 'home', 'school',
  'vacation', 'medical', 'pets', 'other',
]

export default function RemindersPage() {
  const { family, members, currentMember } = useFamily()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [filterPerson, setFilterPerson] = useState('')

  const [form, setForm] = useState({
    title: '',
    assigned_to: '',
    due_date: '',
    repeat_frequency: 'none' as RepeatFrequency,
    priority: 'medium' as Priority,
    category: 'other' as Category,
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!family) return
    fetchReminders()
  }, [family]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchReminders() {
    if (!family) return
    setLoading(true)
    const { data } = await supabase
      .from('reminders')
      .select('*, assigned_member:family_members!reminders_assigned_to_fkey(*)')
      .eq('family_id', family.id)
      .order('completed', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
    setReminders((data as Reminder[]) ?? [])
    setLoading(false)
  }

  async function toggleReminder(id: string, completed: boolean) {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed } : r))
    )
    await supabase.from('reminders').update({ completed }).eq('id', id)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!family) return
    setSaving(true)

    const { error } = await supabase.from('reminders').insert({
      family_id: family.id,
      title: form.title.trim(),
      assigned_to: form.assigned_to || null,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      repeat_frequency: form.repeat_frequency,
      priority: form.priority,
      category: form.category,
      notes: form.notes.trim() || null,
      completed: false,
    })

    if (!error) {
      setShowAdd(false)
      setForm({ title: '', assigned_to: '', due_date: '', repeat_frequency: 'none', priority: 'medium', category: 'other', notes: '' })
      fetchReminders()
    }
    setSaving(false)
  }

  const visible = reminders
    .filter((r) => (showCompleted ? true : !r.completed))
    .filter((r) => (filterPerson ? r.assigned_to === filterPerson : true))

  const incomplete = reminders.filter((r) => !r.completed).length
  const overdue = reminders.filter(
    (r) => !r.completed && r.due_date && new Date(r.due_date) < new Date()
  ).length

  return (
    <AppShell title="Reminders">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">{incomplete} pending</span>
            {overdue > 0 && (
              <span className="ml-2 text-sm font-medium text-red-600">
                {overdue} overdue
              </span>
            )}
          </div>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-sm text-blue-600 font-medium"
          >
            {showCompleted ? 'Hide done' : 'Show done'}
          </button>
        </div>

        {members.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterPerson('')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${
                filterPerson === ''
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              All
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setFilterPerson(filterPerson === m.id ? '' : m.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${
                  filterPerson === m.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {m.display_name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No reminders</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((r) => (
              <ReminderCard key={r.id} reminder={r} onToggle={toggleReminder} />
            ))}
          </div>
        )}
      </div>

      <AddButton onClick={() => setShowAdd(true)} label="Add Reminder" fixed />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Reminder">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Pay electric bill"
            />
          </div>

          <FamilyMemberSelector
            members={members}
            value={form.assigned_to}
            onChange={(v) => setForm({ ...form, assigned_to: v })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due date
              </label>
              <input
                type="datetime-local"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repeat
              </label>
              <select
                value={form.repeat_frequency}
                onChange={(e) => setForm({ ...form, repeat_frequency: e.target.value as RepeatFrequency })}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional notes..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Reminder'}
          </button>
        </form>
      </Modal>
    </AppShell>
  )
}
