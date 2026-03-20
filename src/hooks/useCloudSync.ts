import { useState, useEffect, useCallback } from 'react'
import { syncAllFromCloud } from '../lib/storage'

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export function useCloudSync() {
  const [status, setStatus] = useState<SyncStatus>('syncing')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const sync = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus('offline')
      return
    }
    setStatus('syncing')
    try {
      const hasChanges = await syncAllFromCloud()
      if (hasChanges) {
        // Reload stores by reloading the page state
        // Zustand persist will pick up new localStorage values
        window.dispatchEvent(new CustomEvent('supabase-sync', { detail: { key: 'all' } }))
      }
      setStatus('synced')
      setLastSync(new Date())
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    // Initial sync
    sync()

    // Sync every 30 seconds
    const interval = setInterval(sync, 30_000)

    // Sync when window regains focus
    const onFocus = () => sync()
    window.addEventListener('focus', onFocus)

    // Sync when coming back online
    window.addEventListener('online', sync)

    // Sync on visibility change
    const onVisibility = () => {
      if (!document.hidden) sync()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Sync when offline
    const onOffline = () => setStatus('offline')
    window.addEventListener('offline', onOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('online', sync)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('offline', onOffline)
    }
  }, [sync])

  return { status, lastSync, forceSync: sync }
}
