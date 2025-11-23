'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'

export default function SeekHelpPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const { emit, on } = useSocket()
  const [status, setStatus] = useState<'joining' | 'waiting' | 'matched'>('joining')
  const [matchedCallId, setMatchedCallId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !token) {
      router.push('/login')
      return
    }

    // Join the waiting queue
    console.log('📞 Joining help queue...')
    emit('seek-help:join', { userId: user.id })
    setStatus('waiting')

    // Listen for match
    const handleMatched = (data: { callId: string; watcherId: string }) => {
      console.log('✅ Matched with watcher!', data)
      setStatus('matched')
      setMatchedCallId(data.callId)

      // Redirect to call after a brief delay
      setTimeout(() => {
        router.push(`/call/${data.callId}`)
      }, 1500)
    }

    on('seek-help:matched', handleMatched)

    return () => {
      // Leave queue when component unmounts
      emit('seek-help:leave', { userId: user.id })
    }
  }, [user, token, emit, on, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {status === 'joining' && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Setting up your session
              </p>
            </div>
          )}

          {status === 'waiting' && (
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="absolute -right-1 -bottom-1">
                  <span className="flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-500"></span>
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">Waiting for a Watcher</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                A trained volunteer will connect with you shortly
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>While you wait:</strong>
                </p>
                <ul className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1 text-left">
                  <li>• Make sure your camera and microphone are working</li>
                  <li>• Find a comfortable, private space</li>
                  <li>• Keep emergency contacts nearby</li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Cancel and return to dashboard
              </button>
            </div>
          )}

          {status === 'matched' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">
                Matched!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Connecting you with your watcher...
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>You are not alone. Help is here.</p>
        </div>
      </div>
    </main>
  )
}
