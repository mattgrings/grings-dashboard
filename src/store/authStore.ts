import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { salvarTudoAgora, pararSync } from '../lib/syncStores'

/* ───────── tipos ───────── */
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
  inicializado: boolean   // splash depende disso
  carregando: boolean     // loading de operações (login, etc.)
  inicializar: () => Promise<void>
  login: (email: string, senha: string) => Promise<Perfil>
  logout: () => void
}

/* ───────── helpers ───────── */
const ADMIN_EMAILS = ['matteamconsultoria@gmail.com']

function perfilToAppUser(p: Perfil): AppUser {
  return {
    id: p.id,
    nome: p.nome,
    email: p.email,
    role: p.perfil,
    avatar: p.foto_url ?? undefined,
    telefone: p.telefone ?? undefined,
    instagram: p.instagram ?? undefined,
  }
}

function criarPerfilBasico(id: string, email: string, nome?: string): Perfil {
  return {
    id,
    nome: nome ?? email.split('@')[0],
    email,
    perfil: ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'aluno',
    ativo: true,
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
  }
}

async function buscarPerfil(userId: string): Promise<Perfil | null> {
  try {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return null
    return data as Perfil
  } catch {
    return null
  }
}

/* ───────── store ───────── */
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  perfil: null,
  isAuthenticated: false,
  inicializado: false,
  carregando: false,

  /**
   * Chamado UMA vez no useEffect do App.tsx.
   * Lê sessão do cache local (getSession) — nunca faz request bloqueante.
   */
  inicializar: async () => {
    // Evita dupla chamada
    if (get().inicializado) return

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        set({ inicializado: true })
        return
      }

      const authUser = session.user
      const perfil = await buscarPerfil(authUser.id)
      const perfilFinal = perfil ?? criarPerfilBasico(
        authUser.id,
        authUser.email ?? '',
        authUser.user_metadata?.full_name
      )

      set({
        user: perfilToAppUser(perfilFinal),
        perfil: perfilFinal,
        isAuthenticated: true,
        inicializado: true,
      })
    } catch {
      set({ inicializado: true })
    }
  },

  login: async (email, senha) => {
    set({ carregando: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })
      if (error) throw new Error(error.message)

      const authUser = data.user
      if (!authUser) throw new Error('Erro ao obter usuário')

      const perfil = await buscarPerfil(authUser.id)
      const perfilFinal = perfil ?? criarPerfilBasico(
        authUser.id,
        authUser.email ?? email,
        authUser.user_metadata?.full_name
      )

      set({
        user: perfilToAppUser(perfilFinal),
        perfil: perfilFinal,
        isAuthenticated: true,
        carregando: false,
      })

      return perfilFinal
    } catch (err) {
      set({ carregando: false })
      throw err
    }
  },

  logout: async () => {
    // Salvar tudo no Supabase antes de limpar
    const userId = get().user?.id
    if (userId) {
      try {
        await salvarTudoAgora(userId)
      } catch {
        // ignore — não bloqueia logout
      }
    }

    pararSync()
    set({ user: null, perfil: null, isAuthenticated: false })
    supabase.auth.signOut()
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith('sb-') || key.startsWith('grings-')) {
          localStorage.removeItem(key)
        }
      })
    } catch {
      // ignore
    }
  },
}))

/* ───────── listener ───────── */
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, perfil: null, isAuthenticated: false })
  }
})
