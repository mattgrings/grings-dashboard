import { useState, useCallback } from 'react'
import { mockCreateEvent } from '../lib/googleCalendar'

export function useGoogleCalendar() {
  const [loading, setLoading] = useState(false)
  const [synced, setSynced] = useState(false)

  const syncEvent = useCallback(async (leadName: string, dateTime: string, _duration: number) => {
    setLoading(true)
    try {
      // In demo mode, use mock. In production, use real Google Calendar API
      const result = mockCreateEvent(leadName, dateTime)
      setSynced(true)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  return { syncEvent, loading, synced }
}
