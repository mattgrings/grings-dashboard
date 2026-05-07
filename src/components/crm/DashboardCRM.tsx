import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Funnel, Lightbulb } from '@phosphor-icons/react'
import { format, startOfMonth, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import BottomSheet from '../ui/BottomSheet'
import type { LeadCRM, AlertaCRM, MetaCRM, CaptacaoVolume } from '../../pages/CRM'

interface Props {
  leads: LeadCRM[]
  captacoesVolume: CaptacaoVolume[]
  alertas: AlertaCRM[]
  metas: MetaCRM | null
  mesAtual: string
  onAtualizarMeta: () => void
}

function taxa(num: number, den: number) {
  return den > 0 ? ((num / den) * 100).toFixed(0) + '%' : '—'
}

export default function DashboardCRM({
  leads,
  captacoesVolume,
  metas,
  mesAtual,
  onAtualizarMeta,
}: Props) {
  const [modalMeta, setModalMeta] = useState(false)
  const [formMeta, setFormMeta] = useState({
    meta_abordagens: String(metas?.meta_abordagens ?? ''),
    meta_calls: String(metas?.meta_calls ?? ''),
    meta_vendas: String(metas?.meta_vendas ?? ''),
  })

  const hoje = new Date()
  const inicioMes = startOfMonth(hoje)

  const leadsDoMes = leads.filter(
    (l) => l.criado_em && isAfter(new Date(l.criado_em), inicioMes)
  )

  // Total de abordagens = volume + leads qualificados
  const totalAbordagens =
    captacoesVolume
      .filter((c) => {
        const dataItem = new Date(c.data + 'T12:00:00')
        return isAfter(dataItem, inicioMes)
      })
      .reduce((acc, c) => acc + c.quantidade, 0) + leadsDoMes.length

  const funil = {
    responderam: leadsDoMes.filter((l) =>
      ['respondeu', 'call_marcada', 'call_realizada', 'proposta_enviada', 'convertido'].includes(
        l.status
      )
    ).length,
    callsMarcadas: leadsDoMes.filter((l) =>
      ['call_marcada', 'call_realizada', 'proposta_enviada', 'convertido'].includes(l.status)
    ).length,
    callsRealizadas: leadsDoMes.filter((l) =>
      ['call_realizada', 'proposta_enviada', 'convertido'].includes(l.status)
    ).length,
    convertidos: leadsDoMes.filter((l) => l.status === 'convertido').length,
  }

  const etapasFunil = [
    {
      id: 'captados',
      label: 'Captados / Abordados',
      valor: totalAbordagens,
      meta: metas?.meta_abordagens ?? null,
      cor: '#3B82F6',
      emoji: '📥',
    },
    {
      id: 'responderam',
      label: 'Responderam',
      valor: funil.responderam,
      meta: null as number | null,
      cor: '#8B5CF6',
      emoji: '✉️',
    },
    {
      id: 'calls',
      label: 'Calls marcadas',
      valor: funil.callsMarcadas,
      meta: metas?.meta_calls ?? null,
      cor: '#F59E0B',
      emoji: '📅',
    },
    {
      id: 'realizadas',
      label: 'Calls realizadas',
      valor: funil.callsRealizadas,
      meta: null,
      cor: '#06B6D4',
      emoji: '📞',
    },
    {
      id: 'convertidos',
      label: 'Convertidos',
      valor: funil.convertidos,
      meta: metas?.meta_vendas ?? null,
      cor: '#00E620',
      emoji: '✅',
    },
  ]

  const salvarMeta = async () => {
    await supabase.from('metas_crm').upsert(
      {
        mes: mesAtual,
        meta_abordagens: Number(formMeta.meta_abordagens) || 0,
        meta_calls: Number(formMeta.meta_calls) || 0,
        meta_vendas: Number(formMeta.meta_vendas) || 0,
        meta_faturamento: 0,
      },
      { onConflict: 'mes' }
    )
    setModalMeta(false)
    onAtualizarMeta()
  }

  return (
    <div className="space-y-6">
      {/* KPIs — sem faturamento */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Abordagens',
            valor: totalAbordagens,
            meta: metas?.meta_abordagens,
            emoji: '📥',
            cor: '#3B82F6',
          },
          {
            label: 'Calls realizadas',
            valor: funil.callsRealizadas,
            meta: metas?.meta_calls,
            emoji: '📞',
            cor: '#06B6D4',
          },
          {
            label: 'Convertidos',
            valor: funil.convertidos,
            meta: metas?.meta_vendas,
            emoji: '✅',
            cor: '#00E620',
          },
        ].map((kpi) => {
          const progresso =
            kpi.meta && typeof kpi.valor === 'number'
              ? Math.min((kpi.valor / Number(kpi.meta)) * 100, 100)
              : null

          return (
            <div
              key={kpi.label}
              className="bg-[#161616] border border-white/5 rounded-2xl p-4 relative overflow-hidden"
            >
              <div
                className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl pointer-events-none"
                style={{ background: kpi.cor + '15' }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{kpi.emoji}</span>
                  {kpi.meta && <span className="text-xs text-gray-600">meta: {kpi.meta}</span>}
                </div>
                <p className="text-2xl font-bold text-white">{kpi.valor}</p>
                <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>

                {progresso !== null && (
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: kpi.cor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progresso}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Botao definir metas */}
      <button
        onClick={() => setModalMeta(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border
                   border-dashed border-white/10 text-gray-400 text-sm
                   hover:border-[#00E620] hover:text-[#00E620] transition-all
                   touch-manipulation w-full justify-center"
      >
        <Target size={18} />
        {metas ? 'Editar metas do mês' : 'Definir metas do mês'}
      </button>

      {/* FUNIL VISUAL */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Funnel size={20} color="#00E620" />
            Funil de Vendas — {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
          </h3>
        </div>

        {totalAbordagens === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Nenhuma captação registrada este mês ainda
          </div>
        ) : (
          <div className="space-y-2">
            {etapasFunil.map((etapa, i) => {
              const largura =
                totalAbordagens > 0
                  ? Math.max((etapa.valor / totalAbordagens) * 100, 4)
                  : 0

              return (
                <div key={etapa.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{etapa.emoji}</span>
                      <span className="text-gray-400">{etapa.label}</span>
                      {etapa.meta && (
                        <span className="text-gray-600">(meta: {etapa.meta})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {i > 0 && (
                        <span className="text-gray-600">
                          {taxa(etapa.valor, etapasFunil[i - 1].valor)} da etapa anterior
                        </span>
                      )}
                      <span className="font-bold" style={{ color: etapa.cor }}>
                        {etapa.valor}
                      </span>
                    </div>
                  </div>

                  <div className="h-8 bg-[#111] rounded-xl overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-xl flex items-center px-3"
                      style={{ background: etapa.cor + '30' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${largura}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                    >
                      <motion.div
                        className="h-1 rounded-full flex-1"
                        style={{
                          background: etapa.cor,
                          boxShadow: `0 0 8px ${etapa.cor}60`,
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {totalAbordagens > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-sm text-gray-400">
              Taxa de conversão geral (captados → vendas)
            </span>
            <span className="text-xl font-bold text-[#00E620]">
              {taxa(funil.convertidos, totalAbordagens)}
            </span>
          </div>
        )}
      </div>

      {/* Analise automatica */}
      <AnaliseMelhorias
        funil={{
          captados: totalAbordagens,
          responderam: funil.responderam,
          callsMarcadas: funil.callsMarcadas,
          callsRealizadas: funil.callsRealizadas,
          convertidos: funil.convertidos,
        }}
      />

      {/* Modal de metas — sem faturamento */}
      <BottomSheet
        aberto={modalMeta}
        onFechar={() => setModalMeta(false)}
        titulo="Metas do Mês"
        botaoPrimario={{ label: 'Salvar Metas', onClick: salvarMeta }}
      >
        <div className="space-y-4">
          <div className="flex gap-2 p-3 rounded-xl bg-[#00E620]/[0.08] border border-[#00E620]/20">
            <Target size={18} color="#00E620" className="flex-shrink-0" />
            <p className="text-xs text-gray-400">
              Defina suas metas para acompanhar o progresso no funil. O dashboard vai mostrar o % de
              cada meta atingida.
            </p>
          </div>

          {(
            [
              {
                campo: 'meta_abordagens',
                label: '📥 Meta de abordagens/captações',
                placeholder: 'Ex: 100',
              },
              {
                campo: 'meta_calls',
                label: '📞 Meta de calls realizadas',
                placeholder: 'Ex: 20',
              },
              {
                campo: 'meta_vendas',
                label: '✅ Meta de vendas/conversões',
                placeholder: 'Ex: 8',
              },
            ] as const
          ).map((item) => (
            <div key={item.campo} className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium">{item.label}</label>
              <input
                type="number"
                value={formMeta[item.campo]}
                onChange={(e) => setFormMeta((f) => ({ ...f, [item.campo]: e.target.value }))}
                placeholder={item.placeholder}
                className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3
                           text-white outline-none focus:border-[#00E620] transition-colors
                           text-base"
              />
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}

// ==================== ANALISE MELHORIAS ====================

function AnaliseMelhorias({
  funil,
}: {
  funil: {
    captados: number
    responderam: number
    callsMarcadas: number
    callsRealizadas: number
    convertidos: number
  }
}) {
  const sugestoes: { emoji: string; texto: string; cor: string }[] = []

  if (funil.captados > 0) {
    const txResposta = funil.captados > 0 ? funil.responderam / funil.captados : 0
    const txCall = funil.responderam > 0 ? funil.callsMarcadas / funil.responderam : 0
    const txVenda =
      funil.callsRealizadas > 0 ? funil.convertidos / funil.callsRealizadas : 0

    if (txResposta < 0.1 && funil.captados >= 10)
      sugestoes.push({
        emoji: '📱',
        texto: `Só ${(txResposta * 100).toFixed(0)}% respondem. Revise sua abordagem inicial — o gancho precisa ser mais forte.`,
        cor: '#FF4444',
      })
    else if (txResposta < 0.3 && funil.captados >= 5)
      sugestoes.push({
        emoji: '📱',
        texto: `${(txResposta * 100).toFixed(0)}% de taxa de resposta. Teste abordagens diferentes para melhorar.`,
        cor: '#F59E0B',
      })

    if (txCall < 0.4 && funil.responderam > 0)
      sugestoes.push({
        emoji: '📅',
        texto: `Só ${(txCall * 100).toFixed(0)}% marcam call. Trabalhe mais o aquecimento antes de propor a conversa.`,
        cor: '#F59E0B',
      })

    if (txVenda < 0.3 && funil.callsRealizadas > 0)
      sugestoes.push({
        emoji: '💰',
        texto: `Só ${(txVenda * 100).toFixed(0)}% das calls viram venda. Revise sua oferta, objeções e processo de fechamento.`,
        cor: '#FF4444',
      })

    if (txVenda >= 0.5 && funil.convertidos > 0)
      sugestoes.push({
        emoji: '🔥',
        texto: `Excelente! ${(txVenda * 100).toFixed(0)}% das calls viram venda. Foco agora em aumentar o volume de captação.`,
        cor: '#00E620',
      })
  }

  if (sugestoes.length === 0) return null

  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 space-y-3">
      <h3 className="font-bold text-white flex items-center gap-2">
        <Lightbulb size={20} color="#FFB800" />
        Onde melhorar
      </h3>
      <div className="space-y-2">
        {sugestoes.map((s, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl bg-[#111] border border-white/5">
            <span className="text-xl flex-shrink-0">{s.emoji}</span>
            <p className="text-sm leading-relaxed" style={{ color: s.cor }}>
              {s.texto}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
