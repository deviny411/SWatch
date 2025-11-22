'use client'

import { useState } from 'react'
import { EmergencySeverity } from '@shared/types'

interface EmergencyButtonProps {
  callId: string
  onTrigger: (severity: EmergencySeverity, location: GeolocationPosition) => void
}

export function EmergencyButton({ callId, onTrigger }: EmergencyButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isTriggering, setIsTriggering] = useState(false)

  const handleEmergency = async () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }

    setIsTriggering(true)

    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
        })
      })

      onTrigger(EmergencySeverity.CRITICAL, position)
    } catch (error) {
      console.error('Failed to get location:', error)
      // Trigger emergency anyway without precise location
      onTrigger(EmergencySeverity.CRITICAL, null as any)
    } finally {
      setIsTriggering(false)
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    setIsConfirming(false)
  }

  if (isConfirming) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Confirm Emergency
          </h2>
          <p className="mb-6">
            This will immediately alert emergency services and share your location.
            Are you sure?
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleEmergency}
              disabled={isTriggering}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isTriggering ? 'Alerting...' : 'Yes, Alert Emergency'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isTriggering}
              className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleEmergency}
      className="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-full hover:bg-red-700 shadow-lg animate-pulse"
    >
      🚨 EMERGENCY
    </button>
  )
}
