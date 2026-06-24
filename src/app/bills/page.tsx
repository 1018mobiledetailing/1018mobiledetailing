'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Check, RefreshCw } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { AddButton } from '@/components/AddButton'
import { Modal } from '@/components/Modal'
import { useFamily } from '@/contexts/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import type { Bill } from '@/types/database'

export default function BillsPage() {
  const { family, currentMember } = useFamily()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showPaid, setShowPaid] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    due_date: '',
    amount: '',
    autopay: false,
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (currentMember && currentMember.role === 'child') {
      router.push('/')
    }
  }, [currentMember, router])

  useEffect(() => {
    if (!family) return
    fetchBills()
  }, [family]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchBills() {
    if (!family) return
    setLoading(true)
    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('family_id', family.id)
      .order('paid', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
    setBills(data ?? [])
    setLoading(false)
  }

  async function togglePaid(id: string, paid: boolean) {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, paid } : b)))
    await supabase.from('bills').update({ paid }).eq('id', id)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!family) return
    setSaving(true)

    const { error } = await supabase.from('bills').insert({
      family_id: family.id,
      title: form.title.trim(),
      due_date: form.due_date || null,
      amount: form.amount ? parseFloat(form.amount) : null,
      autopay: form.autopay,
      paid: false,
      notes: form.notes.trim() || null,
      category: 'bills',
    })

    if (!error) {
      setShowAdd(false)
      setForm({ title: '', due_date: '', amount: '', autopay: false, notes: '' })
      fetchBills()
    }
    setSaving(false)
  }

  function getDaysUntil(dateStr: string | null) {
    if (!dateStr) return null
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const visible = bills.filter((b) => (showPaid ? true : !b.paid))
  const totalUnpaid = bills
    .filter((b) => !b.paid && b.amount)
    .reduce((sum, b) => sum + (b.amount ?? 0), 0)

  if (currentMember?.role === 'child') return null

  return (
    <AppShell title="Bills">
      <div className="space-y-4">
        {totalUnpaid > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Total unpaid</span>
            <span className="text-lg font-bold text-blue-700">
              ${totalUnpaid.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {bills.filter((b) => !b.paid).length} unpaid
          </span>
          <button
            onClick={() => setShowPaid((v) => !v)}
            className="text-sm text-blue-600 font-medium"
          >
            {showPaid ? 'Hide paid' : 'Show paid'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No bills yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((bill) => {
              const days = getDaysUntil(bill.due_date)
              const isOverdue = days !== null && days < 0 && !bill.paid
              const isDueSoon = days !== null && days <= 7 && days >= 0 && !bill.paid

              return (
                <div
                  key={bill.id}
                  className={`bg-white rounded-xl border px-4 py-3 flex items-center gap-3 ${
                    isOverdue ? 'border-red-200' : isDueSoon ? 'border-yellow-200' : 'border-gray-100'
                  } ${bill.paid ? 'opacity-50' : ''}`}
                >
                  <button
                    onClick={() => togglePaid(bill.id, !bill.paid)}
                    className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                      bill.paid
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    aria-label={bill.paid ? 'Mark unpaid' : 'Mark paid'}
                  >
                    {bill.paid && (
                      <Check size={14} className="text-white" strokeWidth={3} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium text-sm text-gray-900 ${
                          bill.paid ? 'line-through' : ''
                        }`}
                      >
                        {bill.title}
                      </span>
                      {bill.autopay && (
                        <span className="flex items-center gap-0.5 text-xs text-blue-600">
                          <RefreshCw size={10} />
                          Auto
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {bill.due_date && (
                        <span
                          className={`text-xs font-medium ${
                            isOverdue
                              ? 'text-red-600'
                              : isDueSoon
                              ? 'text-yellow-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {isOverdue
                            ? `${Math.abs(days!)}d overdue`
                            : days === 0
                            ? 'Due today'
                            : days === 1
                            ? 'Due tomorrow'
                            : `Due ${new Date(bill.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                      )}
                      {bill.notes && (
                        <span className="text-xs text-gray-300">·</span>
                      )}
                      {bill.notes && (
                        <span className="text-xs text-gray-400 truncate">
                          {bill.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {bill.amount != null && (
                    <span className="flex-shrink-0 font-semibold text-gray-900 text-sm">
                      ${bill.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AddButton onClick={() => setShowAdd(true)} label="Add Bill" fixed />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Bill">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill name *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Electric bill"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due date
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                step="0.01"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.autopay}
              onChange={(e) => setForm({ ...form, autopay: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Autopay enabled
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional notes..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Bill'}
          </button>
        </form>
      </Modal>
    </AppShell>
  )
}
