'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { useMediaStream } from '@/hooks/useMediaStream'
import { useWebRTC } from '@/hooks/useWebRTC'
import { CallType } from '@shared/types'

export default function TestCallPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { socket, isConnected, emit, on } = useSocket()

  const [callId, setCallId] = useState('')
  const [isInitiator, setIsInitiator] = useState(false)
  const [remoteUserId, setRemoteUserId] = useState('')
  const [inCall, setInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [waitingForPeer, setWaitingForPeer] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // Media stream
  const {
    stream: localStream,
    startStream,
    stopStream,
    toggleAudio,
    toggleVideo,
  } = useMediaStream({ video: true, audio: true })

  // Generate a simple call ID
  const generateCallId = () => {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Start a call (initiator)
  const startCall = async () => {
    const newCallId = generateCallId()
    setCallId(newCallId)
    setIsInitiator(true)
    setInCall(true)
    setWaitingForPeer(true)
    await startStream()

    // Emit that this user created a call room
    emit('test:create-room', { callId: newCallId, userId: user?.id })
  }

  // Join an existing call
  const joinCall = async () => {
    if (!callId.trim()) {
      alert('Please enter a call ID')
      return
    }
    setIsInitiator(false)
    setInCall(true)
    setWaitingForPeer(true)
    await startStream()

    // Emit that this user joined the room
    emit('test:join-room', { callId: callId.trim(), userId: user?.id })
  }

  // WebRTC - only initialize after we have localStream and remoteUserId
  const { remoteStream, connectionState, endCall: webRTCEndCall } = useWebRTC({
    callId,
    isInitiator,
    callType: CallType.VIDEO,
    localStream,
    remoteUserId,
  })

  // Listen for peer joining
  useEffect(() => {
    if (!on) return

    const cleanup1 = on('test:peer-joined', (data: { userId: string }) => {
      console.log('Peer joined:', data.userId)
      setRemoteUserId(data.userId)
      setWaitingForPeer(false)
    })

    const cleanup2 = on('test:peer-waiting', (data: { userId: string }) => {
      console.log('Peer waiting:', data.userId)
      setRemoteUserId(data.userId)
      setWaitingForPeer(false)
    })

    return () => {
      if (cleanup1) cleanup1()
      if (cleanup2) cleanup2()
    }
  }, [on])

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const handleEndCall = () => {
    if (webRTCEndCall) webRTCEndCall()
    stopStream()
    setInCall(false)
    setCallId('')
    setRemoteUserId('')
    setWaitingForPeer(false)
  }

  const handleToggleMute = () => {
    toggleAudio()
    setIsMuted(!isMuted)
  }

  const handleToggleVideo = () => {
    toggleVideo()
    setIsVideoOff(!isVideoOff)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (!inCall) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Test Video Call</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Simple P2P video calling for testing
            </p>
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {isConnected ? 'Connected to server' : 'Connecting...'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Your User ID: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{user.id}</code>
            </div>
          </div>

          {/* Start New Call */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Start New Call</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create a new call and share the Call ID with another person
            </p>
            <button
              onClick={startCall}
              disabled={!isConnected}
              className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
            >
              🎥 Start New Call
            </button>
          </div>

          {/* Join Existing Call */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Join Existing Call</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the Call ID shared by the other person
            </p>
            <input
              type="text"
              value={callId}
              onChange={(e) => setCallId(e.target.value)}
              placeholder="Enter Call ID (e.g., test-123456789)"
              className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={joinCall}
              disabled={!isConnected || !callId.trim()}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              📞 Join Call
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>How to test:</strong> Open this page in 2 browser windows (or 2 devices).
              In window 1, click "Start New Call" and copy the Call ID.
              In window 2, paste the Call ID and click "Join Call".
            </p>
          </div>
        </div>
      </main>
    )
  }

  // In-call UI
  return (
    <div className="relative h-screen bg-gray-900">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-4 right-4 w-64 h-48 object-cover rounded-lg border-2 border-white shadow-lg"
      />

      {/* Call ID Display */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
        <div className="text-xs text-gray-300">Call ID</div>
        <div className="font-mono text-sm">{callId}</div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-20 left-4 px-4 py-2 bg-black bg-opacity-50 text-white rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionState === 'connected' ? 'bg-green-500' :
            connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`}></div>
          <span className="text-sm capitalize">{connectionState}</span>
        </div>
      </div>

      {/* Waiting for peer */}
      {waitingForPeer && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white bg-black bg-opacity-75 p-8 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl mb-2">Waiting for other person to join...</p>
          <p className="text-sm text-gray-300">Share this Call ID with them:</p>
          <p className="font-mono text-lg mt-2">{callId}</p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={handleToggleMute}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
        >
          {isMuted ? '🔇 Unmute' : '🎤 Mute'}
        </button>

        <button
          onClick={handleToggleVideo}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
        >
          {isVideoOff ? '📹 Turn On' : '📹 Turn Off'}
        </button>

        <button
          onClick={handleEndCall}
          className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-semibold"
        >
          🔴 End Call
        </button>
      </div>
    </div>
  )
}
