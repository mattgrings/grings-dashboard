import { useState, useCallback } from 'react'
import { mockCreateCalendarEntry } from '../lib/notionApi'

export function useNotionCalendar() {
  const [loading, setLoading] = useState(false)
  const [synced, setSynced] = useState(false)

  const syncEntry = useCallback(async (nome: string, _telefone: string, dataHora: string, _status: string) => {
    setLoading(true)
    try {
      const result = mockCreateCalendarEntry(nome, dataHora)
      setSynced(true)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  return { syncEntry, loading, synced }
}
