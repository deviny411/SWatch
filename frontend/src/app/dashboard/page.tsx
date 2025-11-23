'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'

interface WaitingUser {
  userId: string
  joinedAt: string
  status: 'waiting' | 'in_call'
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, token, logout, isLoading } = useAuth()
  const { emit, on, isConnected } = useSocket()
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user || !isConnected) return

    console.log('🔌 Socket connected, requesting queue')

    // Request list of waiting users
    emit('watcher:get-queue')

    // Listen for queue updates
    const handleQueueUpdate = (data: { queue: WaitingUser[] }) => {
      console.log('📋 Queue updated:', data.queue)
      setWaitingUsers(data.queue.filter(u => u.status === 'waiting'))
    }

    // Listen for successful match
    const handleMatchSuccess = (data: { callId: string; remoteUserId: string }) => {
      console.log('✅ Match successful, joining call:', data.callId)
      router.push(`/call/${data.callId}?remoteUserId=${data.remoteUserId}&isInitiator=false`)
    }

    on('watcher:queue-update', handleQueueUpdate)
    on('watcher:match-success', handleMatchSuccess)

    // Refresh queue every 5 seconds
    const interval = setInterval(() => {
      if (isConnected) {
        emit('watcher:get-queue')
      }
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [user, emit, on, router, isConnected])

  const handleAcceptUser = (userId: string) => {
    console.log('👍 Accepting user:', userId)
    setConnecting(userId)

    // Just emit the socket event - backend will handle call creation
    emit('watcher:accept-user', { userId, watcherId: user?.id })
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">SafeWatch Watcher Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/watcher-training')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              📚 Training Guide
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Watcher Info */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">You're a Watcher</h2>
              <p className="text-green-100">
                Thank you for volunteering to help keep people safe
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Waiting Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">People Seeking Help</h2>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                {waitingUsers.length} waiting
              </span>
            </div>
          </div>

          <div className="p-6">
            {!isConnected ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Connecting...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Establishing connection to match with users
                </p>
              </div>
            ) : waitingUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No one waiting right now
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  When someone needs help, they'll appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {waitingUsers.map((waitingUser) => {
                  const waitTime = Math.floor(
                    (Date.now() - new Date(waitingUser.joinedAt).getTime()) / 1000
                  )
                  const minutes = Math.floor(waitTime / 60)
                  const seconds = waitTime % 60

                  return (
                    <div
                      key={waitingUser.userId}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">Anonymous User</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Waiting {minutes}:{seconds.toString().padStart(2, '0')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptUser(waitingUser.userId)}
                        disabled={connecting === waitingUser.userId}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                      >
                        {connecting === waitingUser.userId ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting...
                          </span>
                        ) : (
                          'Accept'
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            ℹ️ How it works
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• People seeking help will appear in the list above</li>
            <li>• Click "Accept" to start a video call with them</li>
            <li>• Stay with them throughout their session</li>
            <li>• In an emergency, you can alert emergency services</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
