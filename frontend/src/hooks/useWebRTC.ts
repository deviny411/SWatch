'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import SimplePeer from 'simple-peer'
import { CallStatus, CallType } from '@shared/types'
import { useSocket } from './useSocket'
import { useMediaStream } from './useMediaStream'
import { useAuth } from '@/contexts/AuthContext'

export interface UseWebRTCOptions {
  callId: string
  isInitiator: boolean
  callType: CallType
  localStream: MediaStream | null
  remoteUserId: string
}

export function useWebRTC(options: UseWebRTCOptions) {
  const { callId, isInitiator, callType, localStream, remoteUserId } = options
  const { user } = useAuth()
  const { socket, emit, on } = useSocket()
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] = useState<'new' | 'connecting' | 'connected' | 'failed' | 'closed'>('new')
  const [error, setError] = useState<string | null>(null)

  const peerRef = useRef<SimplePeer.Instance | null>(null)

  // Initialize WebRTC peer connection
  useEffect(() => {
    // Don't create peer until we have local stream, socket, AND remote user ID
    if (!localStream || !socket || !remoteUserId) {
      console.log('⏳ Waiting for requirements:', {
        hasStream: !!localStream,
        hasSocket: !!socket,
        hasRemoteUser: !!remoteUserId
      })
      return
    }

    console.log('🔄 Initializing WebRTC peer connection')
    console.log('  - Initiator:', isInitiator)
    console.log('  - Call type:', callType)
    console.log('  - Remote user:', remoteUserId)

    try {
      // Create peer connection
      const peerConnection = new SimplePeer({
        initiator: isInitiator,
        stream: localStream,
        trickle: true, // Send ICE candidates immediately
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      })

      peerRef.current = peerConnection

      // Handle signaling data (offer/answer/ICE candidates)
      peerConnection.on('signal', (data) => {
        console.log('📤 Sending signal:', data.type, 'from', user?.id, 'to', remoteUserId)
        setConnectionState('connecting')
        emit('call:signal', {
          type: data.type || 'signal',
          callId,
          from: user?.id,
          to: remoteUserId,
          data,
        })
      })

      // Handle remote stream
      peerConnection.on('stream', (stream: MediaStream) => {
        console.log('📥 Received remote stream:', stream.id)
        console.log('   Video tracks:', stream.getVideoTracks().length)
        console.log('   Audio tracks:', stream.getAudioTracks().length)
        setRemoteStream(stream)
      })

      // Handle connection state changes
      peerConnection.on('connect', () => {
        console.log('✅ Peer connection established')
        setConnectionState('connected')

        // Notify server that call is active
        emit('call:active', { callId })
      })

      peerConnection.on('error', (err) => {
        console.error('❌ Peer connection error:', err)
        setError(err.message)
        setConnectionState('failed')
      })

      peerConnection.on('close', () => {
        console.log('🔌 Peer connection closed')
        setConnectionState('closed')
      })

      setPeer(peerConnection)
    } catch (err: any) {
      console.error('Failed to create peer connection:', err)
      setError(err.message)
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy()
        peerRef.current = null
      }
    }
  }, [localStream, socket, isInitiator, remoteUserId, callId, callType, emit])

  // Listen for incoming signals
  useEffect(() => {
    if (!on) return

    const cleanup = on('call:signal', (signal: any) => {
      console.log('📥 Received signal:', signal.type, 'from', signal.from, 'to', signal.to)
      console.log('   Peer exists:', !!peerRef.current)
      console.log('   Signal data:', signal.data ? 'present' : 'missing')

      if (peerRef.current && signal.data) {
        try {
          console.log('   ✅ Processing signal with peer...')
          peerRef.current.signal(signal.data)
        } catch (err) {
          console.error('❌ Error processing signal:', err)
        }
      } else {
        console.warn('⚠️ Cannot process signal - peer not ready or no data')
        console.warn('   peerRef.current:', !!peerRef.current)
        console.warn('   signal.data:', !!signal.data)
      }
    })

    return cleanup
  }, [on])

  const endCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }
    setPeer(null)
    setRemoteStream(null)
    setConnectionState('closed')

    emit('call:end', { callId })
  }, [callId, emit])

  return {
    peer,
    remoteStream,
    connectionState,
    error,
    endCall,
  }
}
