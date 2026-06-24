'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Hammer } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { AddButton } from '@/components/AddButton'
import { Modal } from '@/components/Modal'
import { PriorityBadge } from '@/components/PriorityBadge'
import { FamilyMemberSelector } from '@/components/FamilyMemberSelector'
import { MemberAvatar } from '@/components/FamilyMemberSelector'
import { useFamily } from '@/contexts/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import type { HomeProject, Priority, ProjectStatus } from '@/types/database'

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  planned: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function HomeProjectsPage() {
  const { family, members } = useFamily()
  const [projects, setProjects] = useState<HomeProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | ''>('')

  const [form, setForm] = useState({
    title: '',
    priority: 'medium' as Priority,
    status: 'planned' as ProjectStatus,
    notes: '',
    due_date: '',
    assigned_to: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!family) return
    fetchProjects()
  }, [family]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProjects() {
    if (!family) return
    setLoading(true)
    const { data } = await supabase
      .from('home_projects')
      .select('*, assigned_member:family_members!home_projects_assigned_to_fkey(*)')
      .eq('family_id', family.id)
      .order('status', { ascending: true })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    setProjects((data as HomeProject[]) ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: ProjectStatus) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    )
    await supabase.from('home_projects').update({ status }).eq('id', id)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!family) return
    setSaving(true)

    const { error } = await supabase.from('home_projects').insert({
      family_id: family.id,
      title: form.title.trim(),
      priority: form.priority,
      status: form.status,
      notes: form.notes.trim() || null,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to || null,
    })

    if (!error) {
      setShowAdd(false)
      setForm({ title: '', priority: 'medium', status: 'planned', notes: '', due_date: '', assigned_to: '' })
      fetchProjects()
    }
    setSaving(false)
  }

  const visible = projects.filter((p) =>
    filterStatus ? p.status === filterStatus : true
  )

  const grouped = visible.reduce<Record<string, HomeProject[]>>(
    (acc, p) => {
      if (!acc[p.status]) acc[p.status] = []
      acc[p.status].push(p)
      return acc
    },
    {}
  )

  const statuses: ProjectStatus[] = ['in_progress', 'planned', 'completed']

  return (
    <AppShell title="Home Projects">
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterStatus('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${
              filterStatus === ''
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            All
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${
                filterStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No projects yet</p>
          </div>
        ) : (
          statuses
            .filter((s) => grouped[s]?.length > 0)
            .map((status) => (
              <div key={status}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  {STATUS_LABELS[status]}
                </h3>
                <div className="space-y-2">
                  {(grouped[status] ?? []).map((p) => (
                    <div
                      key={p.id}
                      className={`bg-white rounded-xl border border-gray-100 px-4 py-3 ${
                        p.status === 'completed' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-50 rounded-lg p-2 flex-shrink-0 mt-0.5">
                          <Hammer size={18} className="text-yellow-600" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            {p.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <PriorityBadge priority={p.priority} />
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}
                            >
                              {STATUS_LABELS[p.status]}
                            </span>
                            {p.due_date && (
                              <span className="text-xs text-gray-400">
                                Due{' '}
                                {new Date(p.due_date).toLocaleDateString(
                                  'en-US',
                                  { month: 'short', day: 'numeric' }
                                )}
                              </span>
                            )}
                          </div>
                          {p.notes && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {p.notes}
                            </p>
                          )}
                        </div>
                        {p.assigned_member && (
                          <MemberAvatar member={p.assigned_member} size="sm" />
                        )}
                      </div>

                      <div className="flex gap-2 mt-3 border-t border-gray-50 pt-3">
                        {statuses
                          .filter((s) => s !== p.status)
                          .map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(p.id, s)}
                              className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50"
                            >
                              Move to {STATUS_LABELS[s]}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>

      <AddButton onClick={() => setShowAdd(true)} label="Add Project" fixed />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Home Project">
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
              placeholder="e.g. Fix leaky faucet"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <FamilyMemberSelector members={members} value={form.assigned_to} onChange={(v) => setForm({ ...form, assigned_to: v })} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Details, materials needed, etc." />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Add Project'}
          </button>
        </form>
      </Modal>
    </AppShell>
  )
}
