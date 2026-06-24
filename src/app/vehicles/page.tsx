'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Car, AlertCircle, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { AddButton } from '@/components/AddButton'
import { Modal } from '@/components/Modal'
import { useFamily } from '@/contexts/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import type { Vehicle, VehicleMaintenance } from '@/types/database'

function getDaysUntil(dateStr: string | null) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function DateRow({ label, date }: { label: string; date: string | null }) {
  if (!date) return null
  const days = getDaysUntil(date)
  const isExpired = days !== null && days < 0
  const isDueSoon = days !== null && days <= 30 && days >= 0

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-sm font-medium ${
          isExpired
            ? 'text-red-600'
            : isDueSoon
            ? 'text-yellow-600'
            : 'text-gray-800'
        }`}
      >
        {isExpired
          ? `Expired ${Math.abs(days!)}d ago`
          : days === 0
          ? 'Expires today'
          : `${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        {isDueSoon && !isExpired && (
          <span className="ml-1 text-yellow-500">
            ({days}d)
          </span>
        )}
      </span>
      {(isExpired || isDueSoon) && (
        <AlertCircle
          size={16}
          className={isExpired ? 'text-red-500 ml-1' : 'text-yellow-500 ml-1'}
        />
      )}
    </div>
  )
}

export default function VehiclesPage() {
  const { family } = useFamily()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddMaint, setShowAddMaint] = useState<string | null>(null)
  const [maintenance, setMaintenance] = useState<Record<string, VehicleMaintenance[]>>({})

  const [form, setForm] = useState({
    name: '', make: '', model: '', year: '',
    mileage: '', insurance_expiry: '', inspection_expiry: '',
    registration_expiry: '', notes: '',
  })
  const [maintForm, setMaintForm] = useState({
    title: '', due_mileage: '', due_date: '', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!family) return
    fetchVehicles()
  }, [family]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchVehicles() {
    if (!family) return
    setLoading(true)
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('family_id', family.id)
      .order('created_at', { ascending: false })
    setVehicles(data ?? [])
    setLoading(false)
  }

  async function fetchMaintenance(vehicleId: string) {
    const { data } = await supabase
      .from('vehicle_maintenance')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('completed', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
    setMaintenance((prev) => ({ ...prev, [vehicleId]: data ?? [] }))
  }

  async function toggleMaint(vehicleId: string, id: string, completed: boolean) {
    setMaintenance((prev) => ({
      ...prev,
      [vehicleId]: (prev[vehicleId] ?? []).map((m) =>
        m.id === id ? { ...m, completed } : m
      ),
    }))
    await supabase.from('vehicle_maintenance').update({ completed }).eq('id', id)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!family) return
    setSaving(true)

    const { error } = await supabase.from('vehicles').insert({
      family_id: family.id,
      name: form.name.trim(),
      make: form.make.trim() || null,
      model: form.model.trim() || null,
      year: form.year ? parseInt(form.year) : null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      insurance_expiry: form.insurance_expiry || null,
      inspection_expiry: form.inspection_expiry || null,
      registration_expiry: form.registration_expiry || null,
      notes: form.notes.trim() || null,
    })

    if (!error) {
      setShowAdd(false)
      setForm({ name: '', make: '', model: '', year: '', mileage: '', insurance_expiry: '', inspection_expiry: '', registration_expiry: '', notes: '' })
      fetchVehicles()
    }
    setSaving(false)
  }

  async function handleAddMaint(e: FormEvent) {
    e.preventDefault()
    if (!family || !showAddMaint) return
    setSaving(true)

    const { error } = await supabase.from('vehicle_maintenance').insert({
      vehicle_id: showAddMaint,
      family_id: family.id,
      title: maintForm.title.trim(),
      due_mileage: maintForm.due_mileage ? parseInt(maintForm.due_mileage) : null,
      due_date: maintForm.due_date || null,
      notes: maintForm.notes.trim() || null,
      completed: false,
    })

    if (!error) {
      setMaintForm({ title: '', due_mileage: '', due_date: '', notes: '' })
      setShowAddMaint(null)
      fetchMaintenance(showAddMaint)
    }
    setSaving(false)
  }

  function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      if (!maintenance[id]) fetchMaintenance(id)
    }
  }

  return (
    <AppShell title="Vehicles">
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No vehicles added</p>
          </div>
        ) : (
          vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleExpand(v.id)}
                className="w-full px-4 py-4 flex items-center gap-3 text-left"
              >
                <div className="bg-orange-50 rounded-xl p-2.5">
                  <Car size={22} className="text-orange-600" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{v.name}</div>
                  <div className="text-sm text-gray-500">
                    {[v.year, v.make, v.model].filter(Boolean).join(' ')}
                    {v.mileage ? ` · ${v.mileage.toLocaleString()} mi` : ''}
                  </div>
                </div>
                {expandedId === v.id ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>

              {expandedId === v.id && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Key Dates
                    </h4>
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <DateRow label="Insurance" date={v.insurance_expiry} />
                      <DateRow label="Inspection" date={v.inspection_expiry} />
                      <DateRow label="Registration" date={v.registration_expiry} />
                      {!v.insurance_expiry && !v.inspection_expiry && !v.registration_expiry && (
                        <p className="text-xs text-gray-400 py-1">No dates set</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Maintenance
                      </h4>
                      <button
                        onClick={() => setShowAddMaint(v.id)}
                        className="text-xs text-blue-600 font-medium"
                      >
                        + Add
                      </button>
                    </div>
                    {(maintenance[v.id] ?? []).length === 0 ? (
                      <p className="text-sm text-gray-400">No maintenance items</p>
                    ) : (
                      <div className="space-y-1.5">
                        {(maintenance[v.id] ?? []).map((m) => (
                          <div
                            key={m.id}
                            className={`flex items-center gap-2 ${m.completed ? 'opacity-50' : ''}`}
                          >
                            <button
                              onClick={() => toggleMaint(v.id, m.id, !m.completed)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                m.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                              }`}
                            >
                              {m.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                            </button>
                            <span className={`text-sm text-gray-800 ${m.completed ? 'line-through' : ''}`}>
                              {m.title}
                            </span>
                            {m.due_mileage && (
                              <span className="text-xs text-gray-400">
                                {m.due_mileage.toLocaleString()} mi
                              </span>
                            )}
                            {m.due_date && (
                              <span className="text-xs text-gray-400">
                                {new Date(m.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {v.notes && (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                      {v.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AddButton onClick={() => setShowAdd(true)} label="Add Vehicle" fixed />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Vehicle">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Mom's Honda"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2020" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input type="text" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Honda" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="CR-V" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current mileage</label>
            <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} placeholder="45000" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance expires</label>
            <input type="date" value={form.insurance_expiry} onChange={(e) => setForm({ ...form, insurance_expiry: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inspection expires</label>
            <input type="date" value={form.inspection_expiry} onChange={(e) => setForm({ ...form, inspection_expiry: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration expires</label>
            <input type="date" value={form.registration_expiry} onChange={(e) => setForm({ ...form, registration_expiry: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Optional notes..." />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Add Vehicle'}
          </button>
        </form>
      </Modal>

      <Modal open={!!showAddMaint} onClose={() => setShowAddMaint(null)} title="Add Maintenance Item">
        <form onSubmit={handleAddMaint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={maintForm.title} onChange={(e) => setMaintForm({ ...maintForm, title: e.target.value })} required autoFocus className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Oil change" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due mileage</label>
              <input type="number" value={maintForm.due_mileage} onChange={(e) => setMaintForm({ ...maintForm, due_mileage: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="50000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
              <input type="date" value={maintForm.due_date} onChange={(e) => setMaintForm({ ...maintForm, due_date: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={maintForm.notes} onChange={(e) => setMaintForm({ ...maintForm, notes: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Add Item'}
          </button>
        </form>
      </Modal>
    </AppShell>
  )
}
