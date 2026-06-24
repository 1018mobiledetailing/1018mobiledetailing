'use client'

import { useState, useEffect, FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { Modal } from '@/components/Modal'
import { useFamily } from '@/contexts/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import type { MealPlan, MealType } from '@/types/database'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

function getWeekDates(offset: number): Date[] {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function MealsPage() {
  const { family } = useFamily()
  const [weekOffset, setWeekOffset] = useState(0)
  const [meals, setMeals] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [addTarget, setAddTarget] = useState<{ date: string; mealType: MealType } | null>(null)

  const [form, setForm] = useState({ title: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const weekDates = getWeekDates(weekOffset)
  const weekStart = toDateStr(weekDates[0])
  const weekEnd = toDateStr(weekDates[6])

  useEffect(() => {
    if (!family) return
    fetchMeals()
  }, [family, weekOffset]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchMeals() {
    if (!family) return
    setLoading(true)
    const { data } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('family_id', family.id)
      .gte('plan_date', weekStart)
      .lte('plan_date', weekEnd)
    setMeals(data ?? [])
    setLoading(false)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!family || !addTarget) return
    setSaving(true)

    const { error } = await supabase.from('meal_plans').insert({
      family_id: family.id,
      plan_date: addTarget.date,
      meal_type: addTarget.mealType,
      title: form.title.trim(),
      notes: form.notes.trim() || null,
    })

    if (!error) {
      setAddTarget(null)
      setForm({ title: '', notes: '' })
      fetchMeals()
    }
    setSaving(false)
  }

  async function deleteMeal(id: string) {
    setMeals((prev) => prev.filter((m) => m.id !== id))
    await supabase.from('meal_plans').delete().eq('id', id)
  }

  function getMealsFor(date: string, mealType: MealType) {
    return meals.filter(
      (m) => m.plan_date === date && m.meal_type === mealType
    )
  }

  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <AppShell title="Meal Planner">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset((v) => v - 1)}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900">{weekLabel}</div>
            {weekOffset === 0 && (
              <div className="text-xs text-blue-600">This week</div>
            )}
          </div>
          <button
            onClick={() => setWeekOffset((v) => v + 1)}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="space-y-3">
            {weekDates.map((date) => {
              const dateStr = toDateStr(date)
              const isToday = dateStr === toDateStr(new Date())
              const dayLabel = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })

              return (
                <div
                  key={dateStr}
                  className={`bg-white rounded-xl border overflow-hidden ${
                    isToday ? 'border-blue-200' : 'border-gray-100'
                  }`}
                >
                  <div
                    className={`px-4 py-2 border-b ${
                      isToday
                        ? 'bg-blue-50 border-blue-100'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        isToday ? 'text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {dayLabel}
                      {isToday && (
                        <span className="ml-2 text-xs font-medium bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {MEAL_TYPES.filter(
                      (mt) =>
                        getMealsFor(dateStr, mt).length > 0 ||
                        mt === 'breakfast' ||
                        mt === 'lunch' ||
                        mt === 'dinner'
                    ).map((mealType) => {
                      const dayMeals = getMealsFor(dateStr, mealType)
                      return (
                        <div key={mealType} className="px-4 py-2.5 flex items-start gap-2">
                          <div className="flex-shrink-0 w-20 pt-0.5">
                            <span className="text-xs font-medium text-gray-400">
                              {MEAL_LABELS[mealType]}
                            </span>
                          </div>
                          <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                            {dayMeals.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1"
                              >
                                <span className="text-sm text-gray-800">
                                  {m.title}
                                </span>
                                <button
                                  onClick={() => deleteMeal(m.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() =>
                                setAddTarget({ date: dateStr, mealType })
                              }
                              className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs font-medium"
                            >
                              <Plus size={14} />
                              Add
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        open={!!addTarget}
        onClose={() => setAddTarget(null)}
        title={`Add ${addTarget ? MEAL_LABELS[addTarget.mealType] : ''}`}
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <p className="text-sm text-gray-500">
            {addTarget &&
              new Date(addTarget.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Spaghetti bolognese"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional notes, recipe link, etc."
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Meal'}
          </button>
        </form>
      </Modal>
    </AppShell>
  )
}
