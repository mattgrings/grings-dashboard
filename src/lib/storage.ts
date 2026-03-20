import type { StateStorage } from 'zustand/middleware'

// Custom storage that handles Date serialization
const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && dateRegex.test(value)) {
    return new Date(value)
  }
  return value
}

export const jsonStorage: StateStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name)
    if (!raw) return null
    return JSON.parse(raw, reviver)
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
  },
}
