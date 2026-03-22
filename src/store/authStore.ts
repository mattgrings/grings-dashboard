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

const defaultAlunos: User[] = [
  {
    id: 'aluno-1',
    nome: 'Ana Beatriz',
    email: 'ana@aluno.com',
    senha: 'ana123',
    role: 'aluno' as const,
  },
  {
    id: 'aluno-2',
    nome: 'Pedro Henrique',
    email: 'pedro@aluno.com',
    senha: 'pedro123',
    role: 'aluno' as const,
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [defaultAdmin, ...defaultAlunos],
      isAuthenticated: false,

      login: (email, senha) => {
        // Check persisted users first, then fallback to defaults
        const allUsers = [
          ...get().users,
          defaultAdmin,
          ...defaultAlunos,
        ]
        const found = allUsers.find(
          (u) => u.email === email && u.senha === senha
        )
        if (!found) return false

        // Ensure this user is in the persisted list
        const currentUsers = get().users
        if (!currentUsers.some((u) => u.id === found.id)) {
          set((s) => ({ users: [...s.users, found] }))
        }

        const { senha: _, ...userWithoutSenha } = found
        set({ user: userWithoutSenha, isAuthenticated: true })
        return true
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        // Clear auth data from localStorage
        try {
          localStorage.removeItem('grings-auth')
        } catch {
          // ignore
        }
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
      merge: (persisted, current) => {
        const p = persisted as Partial<AuthState> | undefined
        const persistedUsers = p?.users ?? []
        const allDefaults = [defaultAdmin, ...defaultAlunos]
        // Ensure default users always exist (merge with any registered users)
        const merged = [...allDefaults]
        for (const u of persistedUsers) {
          if (!merged.some((m) => m.id === u.id)) {
            merged.push(u)
          }
        }
        return {
          ...current,
          ...p,
          users: merged,
        }
      },
    }
  )
)
