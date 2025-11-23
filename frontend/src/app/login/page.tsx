'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { loginAnonymous } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleSelect = async (role: 'user' | 'watcher') => {
    setError('')
    setLoading(true)

    try {
      await loginAnonymous()
      // After login, redirect based on role
      if (role === 'user') {
        // User seeking help - go to waiting/matching page
        router.push('/seek-help')
      } else {
        // Watcher - go to dashboard to see available users
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">SafeWatch</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Overdose Prevention Support
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Seeking Help */}
          <button
            onClick={() => handleRoleSelect('user')}
            disabled={loading}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Seeking Help</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with a trained watcher who will stay with you during your session
              </p>
            </div>
          </button>

          {/* Watcher */}
          <button
            onClick={() => handleRoleSelect('watcher')}
            disabled={loading}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Be a Watcher</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Help keep someone safe by monitoring their session
              </p>
            </div>
          </button>
        </div>

        {loading && (
          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2">Connecting...</p>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>SafeWatch connects people who need support with trained volunteers</p>
          <p className="mt-2">All sessions are confidential and anonymous</p>
        </div>
      </div>
    </main>
  )
}
