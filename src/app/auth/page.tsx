'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccessMsg(
          'Check your email for a confirmation link, then sign in.'
        )
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="text-white"
              >
                <path
                  d="M16 4L4 10v12l12 6 12-6V10L16 4z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 10l12 6m0 0l12-6m-12 6v12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">HomeHQ</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Family household management
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                className={`flex-1 py-3.5 text-sm font-semibold ${
                  mode === 'signin'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400'
                }`}
                onClick={() => setMode('signin')}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-3.5 text-sm font-semibold ${
                  mode === 'signup'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400'
                }`}
                onClick={() => setMode('signup')}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                  minLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-60 active:scale-98"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'signin'
                  ? 'Sign In'
                  : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
