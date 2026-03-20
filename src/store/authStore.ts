import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '../types'
import { jsonStorage } from '../lib/storage'

interface AuthState {
  user: Omit<User, 'senha'> | null
  users: User[]
  isAuthenticated: boolean
  login: (email: string, senha: string) => boolean
  logout: () => void
  register: (data: Omit<User, 'id'>) => boolean
}

const defaultAdmin: User = {
  id: 'admin-001',
  nome: 'Grings Team',
  email: 'admin@grings.com',
  senha: 'admin123',
  role: 'admin',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [defaultAdmin],
      isAuthenticated: false,

      login: (email, senha) => {
        const found = get().users.find(
          (u) => u.email === email && u.senha === senha
        )
        if (!found) return false

        const { senha: _, ...userWithoutSenha } = found
        set({ user: userWithoutSenha, isAuthenticated: true })
        return true
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      register: (data) => {
        const exists = get().users.some((u) => u.email === data.email)
        if (exists) return false

        const newUser: User = {
          ...data,
          id: crypto.randomUUID(),
        }
        set((state) => ({ users: [...state.users, newUser] }))
        return true
      },
    }),
    {
      name: 'grings-auth',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({
        user: state.user,
        users: state.users,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
