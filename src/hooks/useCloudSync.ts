import { useState } from 'react'

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export function useCloudSync() {
  const [status] = useState<SyncStatus>('synced')
  const [lastSync] = useState<Date | null>(new Date())

  return { status, lastSync, forceSync: async () => {} }
}
