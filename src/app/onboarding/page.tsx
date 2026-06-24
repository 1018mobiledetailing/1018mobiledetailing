'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

const AVATAR_COLORS = [
  '#2563EB', '#16A34A', '#DC2626', '#9333EA',
  '#EA580C', '#0891B2', '#BE185D', '#65A30D',
]

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth()
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [familyName, setFamilyName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)

    try {
      const { data: family, error: familyErr } = await supabase
        .from('families')
        .insert({ name: familyName, created_by: user.id })
        .select()
        .single()

      if (familyErr || !family) throw familyErr ?? new Error('Failed to create family')

      const { error: memberErr } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          display_name: displayName,
          role: 'admin',
          avatar_color: avatarColor,
        })

      if (memberErr) throw memberErr

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)

    try {
      const { data: family, error: familyErr } = await supabase
        .from('families')
        .select('id')
        .eq('invite_code', inviteCode.trim().toLowerCase())
        .single()

      if (familyErr || !family) {
        setError('Family not found. Check the invite code and try again.')
        return
      }

      const { error: memberErr } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          display_name: displayName,
          role: 'adult',
          avatar_color: avatarColor,
        })

      if (memberErr) throw memberErr

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Set Up HomeHQ</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Create a new family or join an existing one
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                className={`flex-1 py-3.5 text-sm font-semibold ${
                  mode === 'create'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400'
                }`}
                onClick={() => setMode('create')}
              >
                Create Family
              </button>
              <button
                className={`flex-1 py-3.5 text-sm font-semibold ${
                  mode === 'join'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400'
                }`}
                onClick={() => setMode('join')}
              >
                Join Family
              </button>
            </div>

            <form
              onSubmit={mode === 'create' ? handleCreate : handleJoin}
              className="p-6 space-y-4"
            >
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sarah"
                />
              </div>

              {mode === 'create' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Family name
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. The Smith Family"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Invite code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest"
                    placeholder="e.g. abc12345"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={`w-9 h-9 rounded-full border-2 ${
                        avatarColor === color
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60 active:scale-98"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'create'
                  ? 'Create Family'
                  : 'Join Family'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
