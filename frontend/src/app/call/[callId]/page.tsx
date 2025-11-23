'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { useMediaStream } from '@/hooks/useMediaStream'
import { useWebRTC } from '@/hooks/useWebRTC'
import { Call, CallStatus, CallType } from '@shared/types'
import { apiClient } from '@/lib/api'

export default function CallPage() {
  const router = useRouter()
  const params = useParams()
  const callId = params.callId as string

  const { user, token } = useAuth()
  const { emit, on } = useSocket()

  const [call, setCall] = useState<Call | null>(null)
  const [isInitiator, setIsInitiator] = useState(false)
  const [remoteUserId, setRemoteUserId] = useState<string>('')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

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

  // Fetch call details
  useEffect(() => {
    const fetchCall = async () => {
      if (!token) return

      try {
        const response = await apiClient.get<{ call: Call; watcherUserId?: string }>(`/calls/${callId}`, { token })
        setCall(response.call)

        // Determine if this user is the initiator (user seeking help initiates the call)
        const initiator = response.call.userId === user?.id
        setIsInitiator(initiator)

        // Set remote user ID
        // If user seeking help (initiator): remote is watcher's USER ID
        // If watcher (non-initiator): remote is the user seeking help's ID
        const remoteId = initiator ? response.watcherUserId! : response.call.userId
        setRemoteUserId(remoteId)

        console.log('📞 Call details:', {
          isInitiator: initiator,
          localUser: user?.id,
          remoteUserId: remoteId,
          watcherUserId: response.watcherUserId,
          callUserId: response.call.userId,
        })
      } catch (err) {
        console.error('Failed to fetch call:', err)
      }
    }

    fetchCall()
  }, [callId, token, user])

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
    callType: call?.type || CallType.VIDEO,
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
      router.push('/dashboard')
    })

    return cleanup
  }, [on, router])

  const handleEndCall = () => {
    endCall()
    stopStream()
    router.push('/dashboard')
  }

  const handleToggleMute = () => {
    toggleAudio()
    setIsMuted(!isMuted)
  }

  const handleToggleVideo = () => {
    toggleVideo()
    setIsVideoOff(!isVideoOff)
  }

  if (!call || !localStream) {
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
