'use client'

import { useEffect, useRef, useState } from 'react'
import SimplePeer from 'simple-peer'

interface VideoCallProps {
  callId: string
  isInitiator: boolean
  onEnd: () => void
}

export function VideoCall({ callId, isInitiator, onEnd }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  useEffect(() => {
    // TODO: Initialize WebRTC peer connection
    // TODO: Get local media stream
    // TODO: Set up socket listeners for signaling

    return () => {
      // Cleanup
      if (peer) {
        peer.destroy()
      }
    }
  }, [callId, isInitiator])

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  return (
    <div className="relative h-screen bg-gray-900">
      {/* Remote video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local video */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white"
      />

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleMute}
          className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={toggleVideo}
          className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600"
        >
          {isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
        </button>
        <button
          onClick={onEnd}
          className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700"
        >
          End Call
        </button>
      </div>
    </div>
  )
}
