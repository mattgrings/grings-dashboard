import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChartBar, Warning } from '@phosphor-icons/react'
import { format, differenceInDays, isPast } from 'date-fns'
import { supabase } from '../lib/supabase'
import DashboardCRM from '../components/crm/DashboardCRM'
import PipelineCRM from '../components/crm/PipelineCRM'
import FollowUpCRM from '../components/crm/FollowUpCRM'
import AlertasCRM from '../components/crm/AlertasCRM'

// ==================== TYPES ====================

export interface LeadCRM {
  id: string
  nome: string | null
  telefone: string | null
  instagram: string | null
  email: string | null
  origem: string
  status: string
  temperatura: string
  data_contato: string | null
  data_followup: string | null
  data_call: string | null
  data_conversao: string | null
  valor_fechado: number | null
  observacoes: string | null
  motivo_perda: string | null
  tags: string[]
  criado_em: string
}

export interface AlertaCRM {
  id: string
  tipo: 'vencido' | 'vencendo' | 'aviso' | 'followup'
  prioridade: 'alta' | 'media' | 'baixa'
  titulo: string
  descricao: string
  alunoId?: string
  alunoNome?: string
  leadId?: string
  leadNome?: string
  telefone?: string | null
  data: string | null
  acao: string
}

export interface MetaCRM {
  id: string
  mes: string
  meta_abordagens: number
  meta_calls: number
  meta_vendas: number
  meta_faturamento: number
}

export interface InteracaoCRM {
  id: string
  lead_id: string
  tipo: string
  descricao: string
  resultado: string | null
  criado_em: string
}

type AbaCRM = 'dashboard' | 'pipeline' | 'followup' | 'alertas'

// ==================== MAIN PAGE ====================

export default function CRMPage() {
  const [aba, setAba] = useState<AbaCRM>('dashboard')
  const [leads, setLeads] = useState<LeadCRM[]>([])
  const [alertas, setAlertas] = useState<AlertaCRM[]>([])
  const [metas, setMetas] = useState<MetaCRM | null>(null)
  const [carregando, setCarregando] = useState(true)

  const mesAtual = format(new Date(), 'yyyy-MM')

  const carregar = useCallback(async () => {
    setCarregando(true)

    const [{ data: leadsData }, { data: alunosData }, { data: metaData }] =
      await Promise.all([
        supabase.from('captacoes').select('*').order('criado_em', { ascending: false }),
        supabase
          .from('perfis')
          .select('id, nome, data_vencimento, plano, telefone')
          .eq('perfil', 'aluno')
          .eq('ativo', true),
        supabase.from('metas_crm').select('*').eq('mes', mesAtual).maybeSingle(),
      ])

    setLeads((leadsData as LeadCRM[]) ?? [])

    // Gerar alertas automaticos
    const alertasGerados: AlertaCRM[] = []
    const hoje = new Date()

    ;(alunosData ?? []).forEach((aluno: any) => {
      if (!aluno.data_vencimento) return
      const vencimento = new Date(aluno.data_vencimento)
      const diasRestantes = differenceInDays(vencimento, hoje)

      if (diasRestantes < 0) {
        alertasGerados.push({
          id: `venc-${aluno.id}`,
          tipo: 'vencido',
          prioridade: 'alta',
          titulo: `Plano VENCIDO — ${aluno.nome}`,
          descricao: `Venceu ${Math.abs(diasRestantes)} dia${Math.abs(diasRestantes) !== 1 ? 's' : ''} atrás`,
          alunoId: aluno.id,
          alunoNome: aluno.nome,
          telefone: aluno.telefone,
          data: aluno.data_vencimento,
          acao: 'renovar',
        })
      } else if (diasRestantes <= 7) {
        alertasGerados.push({
          id: `venc-${aluno.id}`,
          tipo: 'vencendo',
          prioridade: diasRestantes <= 3 ? 'alta' : 'media',
          titulo: `Vence em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} — ${aluno.nome}`,
          descricao: `Plano ${aluno.plano ?? ''} vence em ${format(vencimento, 'dd/MM')}`,
          alunoId: aluno.id,
          alunoNome: aluno.nome,
          telefone: aluno.telefone,
          data: aluno.data_vencimento,
          acao: 'renovar',
        })
      } else if (diasRestantes <= 15) {
        alertasGerados.push({
          id: `venc-${aluno.id}`,
          tipo: 'aviso',
          prioridade: 'baixa',
          titulo: `Renovação em ${diasRestantes} dias — ${aluno.nome}`,
          descricao: 'Lembrar de entrar em contato para renovação',
          alunoId: aluno.id,
          alunoNome: aluno.nome,
          telefone: aluno.telefone,
          data: aluno.data_vencimento,
          acao: 'lembrete',
        })
      }
    })

    // Leads com follow-up atrasado
    ;((leadsData as LeadCRM[]) ?? []).forEach((lead) => {
      if (
        lead.data_followup &&
        isPast(new Date(lead.data_followup)) &&
        !['convertido', 'perdido'].includes(lead.status)
      ) {
        alertasGerados.push({
          id: `fu-${lead.id}`,
          tipo: 'followup',
          prioridade: 'media',
          titulo: `Follow-up atrasado — ${lead.nome}`,
          descricao: `Deveria ter sido feito em ${format(new Date(lead.data_followup), 'dd/MM')}`,
          leadId: lead.id,
          leadNome: lead.nome ?? undefined,
          telefone: lead.telefone,
          data: lead.data_followup,
          acao: 'followup',
        })
      }
    })

    // Ordenar por prioridade
    const ordemPrioridade: Record<string, number> = { alta: 0, media: 1, baixa: 2 }
    alertasGerados.sort((a, b) => ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade])

    setAlertas(alertasGerados)
    setMetas((metaData as MetaCRM) ?? null)
    setCarregando(false)
  }, [mesAtual])

  useEffect(() => {
    carregar()
  }, [carregar])

  const abas: { id: AbaCRM; label: string; emoji: string; badge: number | null }[] = [
    { id: 'dashboard', label: 'Dashboard', emoji: '📊', badge: null },
    {
      id: 'pipeline',
      label: 'Pipeline',
      emoji: '🔄',
      badge: leads.filter((l) => !['convertido', 'perdido'].includes(l.status)).length || null,
    },
    {
      id: 'followup',
      label: 'Follow-up',
      emoji: '📞',
      badge:
        leads.filter(
          (l) =>
            l.data_followup &&
            isPast(new Date(l.data_followup)) &&
            !['convertido', 'perdido'].includes(l.status)
        ).length || null,
    },
    {
      id: 'alertas',
      label: 'Alertas',
      emoji: '🔔',
      badge: alertas.filter((a) => a.prioridade === 'alta').length || null,
    },
  ]

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 border border-white/5"
        style={{
          background: 'linear-gradient(135deg, rgba(0,230,32,0.12), rgba(0,230,32,0.03))',
        }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl bg-[#00E620]/10 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl bg-[#00E620]/20 border border-[#00E620]/30
                          flex items-center justify-center
                          shadow-[0_0_20px_rgba(0,230,32,0.2)]"
            >
              <ChartBar size={28} color="#00E620" weight="fill" />
            </div>
            <div>
              <h1 className="text-3xl font-display text-white">CRM</h1>
              <p className="text-gray-500 text-sm">Gestão de relacionamento e vendas</p>
            </div>
          </div>

          {/* Alerta rapido de vencimentos */}
          {alertas.filter((a) => a.tipo !== 'followup' && a.prioridade === 'alta').length > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30"
            >
              <Warning size={18} color="#FF4444" weight="fill" />
              <span className="text-red-400 font-bold text-sm">
                {alertas.filter((a) => a.tipo !== 'followup' && a.prioridade === 'alta').length}{' '}
                alerta
                {alertas.filter((a) => a.tipo !== 'followup' && a.prioridade === 'alta').length !== 1
                  ? 's'
                  : ''}{' '}
                urgente
                {alertas.filter((a) => a.tipo !== 'followup' && a.prioridade === 'alta').length !== 1
                  ? 's'
                  : ''}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4">
        {abas.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAba(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border
                        whitespace-nowrap text-sm transition-all touch-manipulation
                        flex-shrink-0 relative ${
                          aba === tab.id
                            ? 'border-[#00E620] bg-[#00E620]/10 text-[#00E620] font-bold'
                            : 'border-white/10 text-gray-400 hover:border-white/20'
                        }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
            {tab.badge ? (
              <span
                className={`min-w-[20px] h-5 rounded-full text-xs font-bold
                            flex items-center justify-center px-1 ${
                              aba === tab.id ? 'bg-[#00E620] text-black' : 'bg-red-500 text-white'
                            }`}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Conteudo */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#00E620]/30 border-t-[#00E620] rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={aba}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {aba === 'dashboard' && (
              <DashboardCRM
                leads={leads}
                alertas={alertas}
                metas={metas}
                mesAtual={mesAtual}
                onAtualizarMeta={carregar}
              />
            )}
            {aba === 'pipeline' && <PipelineCRM leads={leads} onAtualizar={carregar} />}
            {aba === 'followup' && <FollowUpCRM leads={leads} onAtualizar={carregar} />}
            {aba === 'alertas' && <AlertasCRM alertas={alertas} />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
