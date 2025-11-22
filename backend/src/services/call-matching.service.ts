import { watcherModel } from '../models/watcher.model'
import { callModel } from '../models/call.model'
import { Watcher, WatcherStatus } from '@shared/types'

export class CallMatchingService {
  /**
   * Find an available watcher for a call
   * Returns the best available watcher based on current load
   */
  async findAvailableWatcher(): Promise<Watcher | null> {
    const availableWatchers = await watcherModel.findAvailable()

    if (availableWatchers.length === 0) {
      console.log('⚠️ No available watchers found')
      return null
    }

    // Return the watcher with the lowest current call count
    // (They're already sorted by current_call_count in the model)
    const selectedWatcher = availableWatchers[0]

    console.log(`✨ Found available watcher: ${selectedWatcher.id} (${selectedWatcher.availability.currentCallCount} current calls)`)

    return selectedWatcher
  }

  /**
   * Get all pending calls waiting for a watcher
   */
  async getPendingCalls(limit = 10) {
    return callModel.getPendingCalls(limit)
  }

  /**
   * Check if a watcher is available
   */
  async isWatcherAvailable(watcherId: string): Promise<boolean> {
    const watcher = await watcherModel.findById(watcherId)

    if (!watcher) {
      return false
    }

    return (
      watcher.status === WatcherStatus.APPROVED &&
      watcher.availability.isAvailable &&
      watcher.availability.currentCallCount < watcher.availability.maxConcurrentCalls
    )
  }

  /**
   * Get count of available watchers
   */
  async getAvailableWatcherCount(): Promise<number> {
    const watchers = await watcherModel.findAvailable()
    return watchers.length
  }

  /**
   * Auto-assign a watcher to a pending call
   * This would typically be called by a background job or when a watcher comes online
   */
  async autoAssignWatcher(callId: string): Promise<Watcher | null> {
    const watcher = await this.findAvailableWatcher()

    if (!watcher) {
      return null
    }

    // The actual assignment is handled by CallService
    // This just returns the matched watcher
    return watcher
  }
}

export const callMatchingService = new CallMatchingService()
