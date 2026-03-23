import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface Perfil {
  id: string
  nome: string
  email: string
  telefone: string | null
  instagram: string | null
  foto_url: string | null
  perfil: 'admin' | 'aluno'
  ativo: boolean
  aluno_id: string | null
  plano: string | null
  data_inicio: string | null
  data_vencimento: string | null
  objetivo: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string
}

// Interface de compatibilidade — o resto do app usa user.role, user.nome, etc.
export interface AppUser {
  id: string
  nome: string
  email: string
  role: 'admin' | 'aluno'
  avatar?: string
  telefone?: string
  instagram?: string
}

interface AuthState {
  user: AppUser | null
  perfil: Perfil | null
  isAuthenticated: boolean
  carregando: boolean

  login: (email: string, senha: string) => Promise<Perfil>
  logout: () => void
  carregarPerfil: () => Promise<void>
}

function perfilToAppUser(perfil: Perfil): AppUser {
  return {
    id: perfil.id,
    nome: perfil.nome,
    email: perfil.email,
    role: perfil.perfil,
    avatar: perfil.foto_url ?? undefined,
    telefone: perfil.telefone ?? undefined,
    instagram: perfil.instagram ?? undefined,
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  perfil: null,
  isAuthenticated: false,
  carregando: true,

  carregarPerfil: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        set({ user: null, perfil: null, isAuthenticated: false, carregando: false })
        return
      }

      const { data: perfil } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single()

      if (perfil) {
        set({
          user: perfilToAppUser(perfil as Perfil),
          perfil: perfil as Perfil,
          isAuthenticated: true,
          carregando: false,
        })
      } else {
        // Perfil não existe ainda — criar básico
        const novoPerfil: Partial<Perfil> = {
          id: user.id,
          nome: user.user_metadata?.full_name ?? user.email ?? 'Usuário',
          email: user.email ?? '',
          perfil: 'aluno',
          ativo: true,
        }
        await supabase.from('perfis').upsert(novoPerfil)

        const perfilCompleto = {
          ...novoPerfil,
          telefone: null,
          instagram: null,
          foto_url: null,
          aluno_id: null,
          plano: null,
          data_inicio: null,
          data_vencimento: null,
          objetivo: null,
          observacoes: null,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        } as Perfil

        set({
          user: perfilToAppUser(perfilCompleto),
          perfil: perfilCompleto,
          isAuthenticated: true,
          carregando: false,
        })
      }
    } catch {
      set({ user: null, perfil: null, isAuthenticated: false, carregando: false })
    }
  },

  login: async (email, senha) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })
    if (error) throw new Error(error.message)
    await get().carregarPerfil()
    const perfil = get().perfil
    if (!perfil) throw new Error('Perfil não encontrado')
    return perfil
  },

  logout: () => {
    set({ user: null, perfil: null, isAuthenticated: false })
    supabase.auth.signOut()
    try {
      localStorage.removeItem('grings-auth')
    } catch {
      // ignore
    }
  },
}))

// Ouvir mudanças de sessão em tempo real
supabase.auth.onAuthStateChange(async (event) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await useAuthStore.getState().carregarPerfil()
  }
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, perfil: null, isAuthenticated: false })
  }
})

// Carregar perfil ao iniciar
useAuthStore.getState().carregarPerfil()
