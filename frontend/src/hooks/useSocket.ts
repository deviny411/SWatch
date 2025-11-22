'use client'

import { useEffect, useState, useCallback } from 'react'
import { Socket } from 'socket.io-client'
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket'
import { useAuth } from '@/contexts/AuthContext'

export function useSocket() {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user || !token) {
      return
    }

    // Connect to socket server
    const socketInstance = connectSocket(token)

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id)
      setIsConnected(true)

      // Register user with their socket
      socketInstance.emit('user:join', { userId: user.id })
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      disconnectSocket()
      setSocket(null)
      setIsConnected(false)
    }
  }, [user, token])

  const emit = useCallback((event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }, [socket, isConnected])

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback)
      return () => socket.off(event, callback)
    }
  }, [socket])

  return {
    socket,
    isConnected,
    emit,
    on,
  }
}
