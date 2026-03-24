import { carregarTodosDoSupabase, salvarNoSupabase } from './db'

// Imports de todas as stores
import { useAlunosStore } from '../store/alunosStore'
import { useAgendaStore } from '../store/agendaStore'
import { usePlanoTreinoStore } from '../store/planoTreinoStore'
import { useTreinoStore } from '../store/treinoStore'
import { useCargasStore } from '../store/cargasStore'
import { useChatStore } from '../store/chatStore'
import { useFeedbackStore } from '../store/feedbackStore'
import { useFinanceiroStore } from '../store/financeiroStore'
import { useFrequenciaStore } from '../store/frequenciaStore'
import { useGamificacaoStore } from '../store/gamificacaoStore'
import { useLeadsStore } from '../store/leadsStore'
import { useMedidasStore } from '../store/medidasStore'
import { useNotificacoesStore } from '../store/notificacoesStore'
import { useSocialStore } from '../store/socialStore'
import { useTarefasStore } from '../store/tarefasStore'
import { useTemplateStore } from '../store/templateStore'

/* ───────── Mapa de stores ───────── */
// Cada entry: [chave_supabase, zustandStore, campos_de_dados]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoreEntry = [string, any, string[]]

const STORES: StoreEntry[] = [
  ['grings-alunos', useAlunosStore, ['alunos', 'fotos', 'treinos', 'dietas']],
  ['grings-agenda', useAgendaStore, ['eventos']],
  ['grings-planos-treino', usePlanoTreinoStore, ['planos', 'exerciciosCustom']],
  ['grings-treinos', useTreinoStore, ['planos', 'exerciciosCustom']],
  ['grings-cargas', useCargasStore, ['registros']],
  ['grings-chat', useChatStore, ['conversas', 'mensagens']],
  ['grings-feedbacks', useFeedbackStore, ['feedbacks']],
  ['grings-financeiro', useFinanceiroStore, ['meses', 'mesAtualId']],
  ['grings-frequencia', useFrequenciaStore, ['registros']],
  ['grings-gamificacao', useGamificacaoStore, ['desbloqueadas', 'streaks']],
  ['grings-leads', useLeadsStore, ['leads']],
  ['grings-medidas', useMedidasStore, ['medidas']],
  ['grings-notificacoes', useNotificacoesStore, ['notificacoes']],
  ['grings-social', useSocialStore, ['conteudos', 'ideias']],
  ['grings-tarefas', useTarefasStore, ['tarefas']],
  ['grings-templates', useTemplateStore, ['pastas', 'templates']],
]

/* ───────── Helpers ───────── */

function extrairDados(store: any, campos: string[]): Record<string, unknown> {
  const state = store.getState()
  const dados: Record<string, unknown> = {}
  for (const campo of campos) {
    dados[campo] = state[campo]
  }
  return dados
}

function temDados(dados: Record<string, unknown>): boolean {
  return Object.values(dados).some((v) => {
    if (Array.isArray(v)) return v.length > 0
    if (v && typeof v === 'object') return Object.keys(v).length > 0
    return v !== null && v !== undefined && v !== ''
  })
}

/* ───────── Carregar tudo do Supabase ───────── */

export async function carregarDadosDoServidor(userId: string): Promise<void> {
  console.log('[sync] Carregando dados do Supabase...')

  const dadosServidor = await carregarTodosDoSupabase(userId)

  if (dadosServidor.size === 0) {
    // Nenhum dado no servidor — salvar dados locais atuais (migração)
    console.log('[sync] Nenhum dado no servidor. Migrando localStorage → Supabase...')
    await migrarLocalParaServidor(userId)
    return
  }

  // Hidratar stores com dados do servidor
  for (const [chave, store, campos] of STORES) {
    const dadosRemoto = dadosServidor.get(chave)
    if (!dadosRemoto || typeof dadosRemoto !== 'object') continue

    const remoto = dadosRemoto as Record<string, unknown>
    const update: Record<string, unknown> = {}
    let algumCampo = false

    for (const campo of campos) {
      if (campo in remoto) {
        update[campo] = remoto[campo]
        algumCampo = true
      }
    }

    if (algumCampo) {
      store.setState(update)
    }
  }

  console.log('[sync] Dados carregados do servidor:', dadosServidor.size, 'stores')
}

/* ───────── Migrar localStorage → Supabase ───────── */

async function migrarLocalParaServidor(userId: string): Promise<void> {
  const promises: Promise<void>[] = []

  for (const [chave, store, campos] of STORES) {
    const dados = extrairDados(store, campos)
    if (temDados(dados)) {
      promises.push(salvarNoSupabase(userId, chave, dados))
    }
  }

  await Promise.allSettled(promises)
  console.log('[sync] Migração concluída:', promises.length, 'stores salvas')
}

/* ───────── Sync em tempo real (subscribe) ───────── */

let unsubscribes: (() => void)[] = []
const timers = new Map<string, ReturnType<typeof setTimeout>>()

export function iniciarSync(userId: string): void {
  pararSync() // Limpa subscriptions anteriores

  console.log('[sync] Iniciando sync em tempo real...')

  for (const [chave, store, campos] of STORES) {
    // Salvar estado anterior para comparação
    let estadoAnterior = JSON.stringify(extrairDados(store, campos))

    const unsub = store.subscribe(() => {
      const dadosAtuais = extrairDados(store, campos)
      const estadoAtual = JSON.stringify(dadosAtuais)

      // Só salva se realmente mudou
      if (estadoAtual === estadoAnterior) return
      estadoAnterior = estadoAtual

      // Debounce de 2s para não sobrecarregar o Supabase
      const timerExistente = timers.get(chave)
      if (timerExistente) clearTimeout(timerExistente)

      timers.set(
        chave,
        setTimeout(() => {
          salvarNoSupabase(userId, chave, dadosAtuais)
          timers.delete(chave)
        }, 2000)
      )
    })

    unsubscribes.push(unsub)
  }
}

export function pararSync(): void {
  for (const unsub of unsubscribes) {
    unsub()
  }
  unsubscribes = []

  // Limpar timers pendentes
  for (const timer of timers.values()) {
    clearTimeout(timer)
  }
  timers.clear()
}

/* ───────── Salvar tudo imediatamente (antes de logout) ───────── */

export async function salvarTudoAgora(userId: string): Promise<void> {
  // Cancelar debounces pendentes
  for (const timer of timers.values()) {
    clearTimeout(timer)
  }
  timers.clear()

  const promises: Promise<void>[] = []

  for (const [chave, store, campos] of STORES) {
    const dados = extrairDados(store, campos)
    if (temDados(dados)) {
      promises.push(salvarNoSupabase(userId, chave, dados))
    }
  }

  await Promise.allSettled(promises)
  console.log('[sync] Tudo salvo antes de sair')
}
