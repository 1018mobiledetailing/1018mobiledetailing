'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { AppShell } from '@/components/AppShell'
import { UploadCard } from '@/components/UploadCard'
import { AddButton } from '@/components/AddButton'
import { Modal } from '@/components/Modal'
import { FamilyMemberSelector } from '@/components/FamilyMemberSelector'
import { useFamily } from '@/contexts/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import type { Upload, Category } from '@/types/database'
import { ExternalLink } from 'lucide-react'

const CATEGORIES: Category[] = [
  'groceries', 'bills', 'vehicles', 'home', 'school',
  'vacation', 'medical', 'pets', 'other',
]

export default function UploadsPage() {
  const { family, members, currentMember } = useFamily()
  const [uploads, setUploads] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<Category | ''>('')

  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '',
    category: 'other' as Category,
    notes: '',
    assigned_to: '',
  })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (!family) return
    fetchUploads()
  }, [family]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchUploads() {
    if (!family) return
    setLoading(true)
    const { data } = await supabase
      .from('uploads')
      .select('*')
      .eq('family_id', family.id)
      .order('created_at', { ascending: false })
    setUploads(data ?? [])
    setLoading(false)
  }

  async function handleView(upload: Upload) {
    const { data } = await supabase.storage
      .from('uploads')
      .createSignedUrl(upload.storage_path, 60)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault()
    if (!family || !currentMember || !file) return
    setUploadError('')
    setUploading(true)

    try {
      const ext = file.name.split('.').pop()
      const path = `${family.id}/${currentMember.id}/${Date.now()}.${ext}`

      const { error: storageErr } = await supabase.storage
        .from('uploads')
        .upload(path, file, { upsert: false })

      if (storageErr) throw storageErr

      const { error: dbErr } = await supabase.from('uploads').insert({
        family_id: family.id,
        storage_path: path,
        title: form.title.trim() || file.name,
        file_type: file.type || null,
        category: form.category,
        notes: form.notes.trim() || null,
        assigned_to: form.assigned_to || null,
        created_by: currentMember.id,
      })

      if (dbErr) throw dbErr

      setShowAdd(false)
      setFile(null)
      setForm({ title: '', category: 'other', notes: '', assigned_to: '' })
      fetchUploads()
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    if (!form.title) {
      setForm((prev) => ({ ...prev, title: f.name.replace(/\.[^/.]+$/, '') }))
    }
  }

  const visible = uploads.filter((u) =>
    filterCategory ? u.category === filterCategory : true
  )

  return (
    <AppShell title="Uploads">
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCategory('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${
              filterCategory === ''
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(filterCategory === c ? '' : c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${
                filterCategory === c
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No uploads yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Upload images, PDFs, or documents
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((u) => (
              <UploadCard key={u.id} upload={u} onView={handleView} />
            ))}
          </div>
        )}
      </div>

      <AddButton onClick={() => setShowAdd(true)} label="Upload File" fixed />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Upload File">
        <form onSubmit={handleUpload} className="space-y-4">
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File *
            </label>
            <input
              type="file"
              accept="image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium file:py-1 file:px-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Car insurance card"
            />
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

          <FamilyMemberSelector
            members={members}
            value={form.assigned_to}
            onChange={(v) => setForm({ ...form, assigned_to: v })}
            label="For"
          />

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
            disabled={uploading || !file}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </Modal>
    </AppShell>
  )
}
