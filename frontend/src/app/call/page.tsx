'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { CallType } from '@shared/types'
import { apiClient } from '@/lib/api'

export default function RequestCallPage() {
  const router = useRouter()
  const { user, token, isLoading: authLoading } = useAuth()
  const { socket, isConnected, emit, on } = useSocket()
  const [callType, setCallType] = useState<CallType>(CallType.VIDEO)
  const [isRequesting, setIsRequesting] = useState(false)
  const [availableWatchers, setAvailableWatchers] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // Check for available watchers
  useEffect(() => {
    const checkWatchers = async () => {
      if (!token) return

      try {
        const response = await apiClient.get<{ count: number; available: boolean }>(
          '/calls/available-watchers',
          { token }
        )
        setAvailableWatchers(response.count)
      } catch (err) {
        console.error('Failed to check watchers:', err)
      }
    }

    checkWatchers()
  }, [token])

  // Listen for socket events
  useEffect(() => {
    if (!on) return

    const cleanupWatcherAssigned = on('call:watcher-assigned', (data: { callId: string; watcherId: string }) => {
      console.log('✅ Watcher assigned:', data)
      // Redirect to call page
      router.push(`/call/${data.callId}`)
    })

    const cleanupNoWatchers = on('call:no-watchers', (data: { callId: string }) => {
      console.log('⚠️ No watchers available')
      setError('No watchers available right now. Please try again in a few moments.')
      setIsRequesting(false)
    })

    const cleanupError = on('call:error', (data: { message: string }) => {
      console.error('Call error:', data.message)
      setError(data.message)
      setIsRequesting(false)
    })

    return () => {
      if (cleanupWatcherAssigned) cleanupWatcherAssigned()
      if (cleanupNoWatchers) cleanupNoWatchers()
      if (cleanupError) cleanupError()
    }
  }, [on, router])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const requestCall = async () => {
    if (!user || !isConnected) {
      setError('Not connected to server')
      return
    }

    setIsRequesting(true)
    setError(null)

    try {
      // Request call via socket
      emit('call:request', {
        userId: user.id,
        type: callType,
      })

      console.log('📞 Requesting call...')
    } catch (err: any) {
      setError(err.message || 'Failed to request call')
      setIsRequesting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Request a Watcher</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect with a trained volunteer watcher
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Watchers</p>
              <p className="text-2xl font-bold">
                {availableWatchers}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full ${
              availableWatchers > 0
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            }`}>
              {availableWatchers > 0 ? 'Available' : 'Offline'}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected to server' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Call Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">Call Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCallType(CallType.VIDEO)}
              className={`p-4 rounded-lg border-2 transition ${
                callType === CallType.VIDEO
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-3xl mb-2">📹</div>
              <div className="font-semibold">Video Call</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Full video and audio
              </div>
            </button>

            <button
              onClick={() => setCallType(CallType.AUDIO_ONLY)}
              className={`p-4 rounded-lg border-2 transition ${
                callType === CallType.AUDIO_ONLY
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-3xl mb-2">🎤</div>
              <div className="font-semibold">Audio Only</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Voice call only
              </div>
            </button>
          </div>
        </div>

        {/* Request Button */}
        <button
          onClick={requestCall}
          disabled={isRequesting || !isConnected || availableWatchers === 0}
          className="w-full px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isRequesting ? 'Connecting...' : 'Request Watcher Now'}
        </button>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>What to expect:</strong> You'll be connected with a trained volunteer watcher
            who will monitor you during your session. They can trigger emergency response if needed.
          </p>
        </div>
      </div>
    </main>
  )
}
