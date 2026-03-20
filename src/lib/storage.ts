import type { StateStorage } from 'zustand/middleware'
import { supabase } from './supabase'

// Custom storage that handles Date serialization
const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && dateRegex.test(value)) {
    return new Date(value)
  }
  return value
}

// Track pending syncs to avoid duplicates
const syncQueue = new Map<string, ReturnType<typeof setTimeout>>()

// Write to Supabase (debounced — waits 500ms after last write)
function syncToSupabase(name: string, value: string) {
  const existing = syncQueue.get(name)
  if (existing) clearTimeout(existing)

  syncQueue.set(
    name,
    setTimeout(async () => {
      syncQueue.delete(name)
      try {
        const parsed = JSON.parse(value)
        await supabase
          .from('stores')
          .upsert(
            { key: name, value: parsed, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          )
      } catch (e) {
        console.warn(`[Sync] Failed to sync "${name}" to cloud:`, e)
      }
    }, 500)
  )
}

// Read from Supabase
async function readFromSupabase(name: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('value')
      .eq('key', name)
      .single()

    if (error || !data) return null
    return JSON.stringify(data.value)
  } catch {
    return null
  }
}

// Hybrid storage: localStorage for speed + Supabase for sync
export const jsonStorage: StateStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name)

    // Also fetch from Supabase in background to ensure latest data
    readFromSupabase(name).then((cloudData) => {
      if (cloudData) {
        const localRaw = localStorage.getItem(name)
        // If cloud data is different from local, update local
        if (cloudData !== localRaw) {
          localStorage.setItem(name, cloudData)
          // Trigger a page-level event so stores can rehydrate
          window.dispatchEvent(new CustomEvent('supabase-sync', { detail: { key: name } }))
        }
      }
    })

    if (!raw) return null
    return JSON.parse(raw, reviver)
  },

  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value))
    // Sync to cloud
    syncToSupabase(name, JSON.stringify(value))
  },

  removeItem: (name) => {
    localStorage.removeItem(name)
    supabase.from('stores').delete().eq('key', name).then(() => {})
  },
}

// Force sync all stores from Supabase (call on app start and on focus)
export async function syncAllFromCloud(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('key, value')

    if (error || !data) return false

    let hasChanges = false
    for (const row of data) {
      const cloudJson = JSON.stringify(row.value)
      const localJson = localStorage.getItem(row.key)
      if (cloudJson !== localJson) {
        localStorage.setItem(row.key, cloudJson)
        hasChanges = true
      }
    }

    return hasChanges
  } catch {
    return false
  }
}
