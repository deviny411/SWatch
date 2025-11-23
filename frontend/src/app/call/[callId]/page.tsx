'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { useMediaStream } from '@/hooks/useMediaStream'
import { useWebRTC } from '@/hooks/useWebRTC'
import { CallType } from '@shared/types'

export default function CallPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const callId = params.callId as string
  // Get remoteUserId and isInitiator from URL params (passed by matching flow)
  const remoteUserIdParam = searchParams.get('remoteUserId')
  const isInitiatorParam = searchParams.get('isInitiator') === 'true'

  const { user, token } = useAuth()
  const { emit, on } = useSocket()

  const [isInitiator] = useState(isInitiatorParam)
  const [remoteUserId] = useState(remoteUserIdParam || '')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [emergencyTriggered, setEmergencyTriggered] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // Debug logging
  useEffect(() => {
    console.log('🔍 Call page loaded with params:', {
      callId,
      remoteUserId,
      isInitiator,
      hasUser: !!user,
      rawParams: {
        remoteUserIdParam,
        isInitiatorParam
      },
      fullURL: typeof window !== 'undefined' ? window.location.href : 'SSR'
    })

    if (!remoteUserIdParam) {
      console.error('❌ ERROR: remoteUserId is missing from URL params!')
      console.error('   Full URL:', typeof window !== 'undefined' ? window.location.href : 'SSR')
      console.error('   This will prevent WebRTC from initializing!')
    }
  }, [callId, remoteUserId, isInitiator, user, remoteUserIdParam, isInitiatorParam])

  // Get media stream
  const {
    stream: localStream,
    startStream,
    stopStream,
    toggleAudio,
    toggleVideo,
  } = useMediaStream({
    video: true,
    audio: true,
  })

  // Log call details once we have them
  useEffect(() => {
    if (remoteUserId && user) {
      console.log('📞 Call setup:', {
        callId,
        isInitiator,
        localUser: user.id,
        remoteUserId,
      })
    }
  }, [callId, isInitiator, user, remoteUserId])

  // Start local stream
  useEffect(() => {
    startStream()

    return () => {
      stopStream()
    }
  }, [])

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Initialize WebRTC
  const { remoteStream, connectionState, endCall } = useWebRTC({
    callId,
    isInitiator,
    callType: CallType.VIDEO,
    localStream,
    remoteUserId,
  })

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Listen for call ended event
  useEffect(() => {
    if (!on) return

    const cleanup = on('call:ended', (data: { callId: string; reason?: string }) => {
      console.log('Call ended:', data)
      alert(data.reason === 'disconnect' ? 'Other user disconnected' : 'Call ended')
      // Route based on role: watchers go to dashboard, users seeking help go to login
      router.push(isInitiator ? '/login' : '/dashboard')
    })

    return cleanup
  }, [on, router, isInitiator])

  // Listen for emergency triggered
  useEffect(() => {
    if (!on) return

    const cleanup = on('call:emergency-triggered', (data: { callId: string; message: string }) => {
      console.log('🚨 Emergency triggered:', data)
      setEmergencyTriggered(true)
      if (isInitiator) {
        alert('🚨 EMERGENCY ALERT\n\nThe watcher has notified emergency services.\nHelp is on the way!')
      }
    })

    return cleanup
  }, [on, isInitiator])

  const handleEndCall = () => {
    endCall()
    stopStream()
    // Route based on role: watchers go to dashboard, users seeking help go to login
    router.push(isInitiator ? '/login' : '/dashboard')
  }

  const handleToggleMute = () => {
    toggleAudio()
    setIsMuted(!isMuted)
  }

  const handleToggleVideo = () => {
    toggleVideo()
    setIsVideoOff(!isVideoOff)
  }

  const handleEmergency = async () => {
    if (emergencyTriggered) return

    const confirmed = confirm(
      '⚠️ EMERGENCY ALERT\n\nThis will:\n• Mark the call as an emergency\n• Notify emergency services\n• Send location and call details to 911\n\nProceed with emergency response?'
    )

    if (!confirmed) return

    try {
      setEmergencyTriggered(true)

      // Emit emergency event via socket
      emit('call:emergency', { callId })

      // Also mark via API
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calls/${callId}/emergency`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }

      alert('✅ Emergency services have been notified!')
    } catch (err) {
      console.error('Failed to trigger emergency:', err)
      alert('❌ Failed to contact emergency services. Please call 911 directly.')
      setEmergencyTriggered(false)
    }
  }

  if (!remoteUserId || !localStream) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Setting up call...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen bg-gray-900">
      {/* Remote Video (Full Screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local Video (Picture-in-Picture) */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-4 right-4 w-64 h-48 object-cover rounded-lg border-2 border-white shadow-lg"
      />

      {/* Connection Status */}
      <div className="absolute top-4 left-4 px-4 py-2 bg-black bg-opacity-50 text-white rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionState === 'connected' ? 'bg-green-500' :
            connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`}></div>
          <span className="text-sm capitalize">{connectionState}</span>
        </div>
      </div>

      {/* Emergency Controls (Watcher Only) */}
      {!isInitiator && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-2">
          <button
            onClick={handleEmergency}
            disabled={emergencyTriggered}
            className={`px-6 py-3 rounded-lg font-bold shadow-lg transition ${
              emergencyTriggered
                ? 'bg-orange-600 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 animate-pulse'
            } text-white`}
          >
            {emergencyTriggered ? '🚨 EMERGENCY ACTIVE' : '🚨 TRIGGER EMERGENCY'}
          </button>
          {emergencyTriggered && (
            <div className="bg-red-900 text-white px-4 py-2 rounded text-sm text-center">
              Emergency services notified
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={handleToggleMute}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
        >
          {isMuted ? '🔇 Unmute' : '🎤 Mute'}
        </button>

        <button
          onClick={handleToggleVideo}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            isVideoOff
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
        >
          {isVideoOff ? '📹 Turn On Video' : '📹 Turn Off Video'}
        </button>

        <button
          onClick={handleEndCall}
          className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-semibold"
        >
          🔴 End Call
        </button>
      </div>

      {/* No Remote Stream Warning */}
      {!remoteStream && connectionState === 'connected' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <p className="text-xl">Waiting for remote stream...</p>
        </div>
      )}
    </div>
  )
}
