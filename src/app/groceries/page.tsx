'use client'

import { useState, useEffect, FormEvent } from 'react'
import { AppShell } from '@/components/AppShell'
import { GroceryItem } from '@/components/GroceryItem'
import { AddButton } from '@/components/AddButton'
import { Modal } from '@/components/Modal'
import { useFamily } from '@/contexts/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import type { GroceryItem as GroceryItemType, Category } from '@/types/database'

const CATEGORIES: Category[] = [
  'groceries', 'home', 'pets', 'school', 'medical', 'other',
]

const STORES = ['Any Store', 'Walmart', 'Costco', 'Target', 'Kroger', 'Whole Foods', 'Aldi', 'Trader Joe\'s']

export default function GroceriesPage() {
  const { family, members, currentMember } = useFamily()
  const [items, setItems] = useState<GroceryItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  const [form, setForm] = useState({
    name: '',
    quantity: '1',
    category: 'groceries' as Category,
    needed_by: '',
    assigned_store: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!family) return
    fetchItems()
  }, [family]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchItems() {
    if (!family) return
    setLoading(true)
    const { data } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('family_id', family.id)
      .order('completed', { ascending: true })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  async function toggleItem(id: string, completed: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed } : i))
    )
    await supabase
      .from('grocery_items')
      .update({ completed })
      .eq('id', id)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!family || !currentMember) return
    setSaving(true)

    const { error } = await supabase.from('grocery_items').insert({
      family_id: family.id,
      name: form.name.trim(),
      quantity: form.quantity || '1',
      category: form.category,
      needed_by: form.needed_by || null,
      added_by: currentMember.id,
      assigned_store: form.assigned_store || null,
      priority: form.priority,
      completed: false,
    })

    if (!error) {
      setShowAdd(false)
      setForm({ name: '', quantity: '1', category: 'groceries', needed_by: '', assigned_store: '', priority: 'medium' })
      fetchItems()
    }
    setSaving(false)
  }

  const visible = items.filter((i) =>
    showCompleted ? true : !i.completed
  )

  const grouped = visible.reduce<Record<string, GroceryItemType[]>>(
    (acc, item) => {
      const key = item.category
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {}
  )

  const incompleteCount = items.filter((i) => !i.completed).length

  return (
    <AppShell title="Groceries">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {incompleteCount} item{incompleteCount !== 1 ? 's' : ''} needed
          </p>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-sm text-blue-600 font-medium"
          >
            {showCompleted ? 'Hide done' : 'Show done'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Loading...
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No items yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Tap the button to add groceries
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <GroceryItem key={item.id} item={item} onToggle={toggleItem} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <AddButton onClick={() => setShowAdd(true)} label="Add Item" fixed />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Grocery Item">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Milk"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="text"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store
            </label>
            <select
              value={form.assigned_store}
              onChange={(e) => setForm({ ...form, assigned_store: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STORES.map((s) => (
                <option key={s} value={s === 'Any Store' ? '' : s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Needed by
            </label>
            <input
              type="date"
              value={form.needed_by}
              onChange={(e) => setForm({ ...form, needed_by: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60"
          >
            {saving ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </Modal>
    </AppShell>
  )
}
