'use client'

import { useState, useEffect, useCallback } from 'react'

export interface MediaStreamOptions {
  video: boolean
  audio: boolean
}

export function useMediaStream(options: MediaStreamOptions) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const startStream = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: options.video ? { width: 1280, height: 720 } : false,
        audio: options.audio,
      })

      setStream(mediaStream)
      console.log('📹 Media stream started:', mediaStream.id)
    } catch (err: any) {
      console.error('Failed to get media stream:', err)
      setError(err.message || 'Failed to access camera/microphone')
    } finally {
      setIsLoading(false)
    }
  }, [options.video, options.audio])

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
        console.log('⏹️ Stopped track:', track.kind)
      })
      setStream(null)
    }
  }, [stream])

  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        console.log('📹 Video:', videoTrack.enabled ? 'enabled' : 'disabled')
      }
    }
  }, [stream])

  const toggleAudio = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        console.log('🎤 Audio:', audioTrack.enabled ? 'enabled' : 'disabled')
      }
    }
  }, [stream])

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [])

  return {
    stream,
    error,
    isLoading,
    startStream,
    stopStream,
    toggleVideo,
    toggleAudio,
  }
}
