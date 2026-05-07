import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, WhatsappLogo, CaretDown, CheckCircle } from '@phosphor-icons/react'
import { isPast, differenceInDays, addDays, format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import EmptyState from '../ui/EmptyState'
import type { LeadCRM } from '../../pages/CRM'

interface Props {
  leads: LeadCRM[]
  onAtualizar: () => void
}

export default function FollowUpCRM({ leads, onAtualizar }: Props) {
  const precisamFollowup = leads
    .filter((l) => !['convertido', 'perdido'].includes(l.status))
    .filter((l) => {
      if (l.data_followup) return isPast(new Date(l.data_followup))
      // Sem data definida e criado há mais de 2 dias
      return l.criado_em && differenceInDays(new Date(), new Date(l.criado_em)) >= 2
    })
    .sort((a, b) => {
      const tempoA = a.data_followup
        ? differenceInDays(new Date(), new Date(a.data_followup))
        : 99
      const tempoB = b.data_followup
        ? differenceInDays(new Date(), new Date(b.data_followup))
        : 99
      return tempoB - tempoA
    })

  const definirFollowup = async (leadId: string, data: string, observacao: string) => {
    await supabase
      .from('captacoes')
      .update({ data_followup: data, observacoes: observacao || undefined })
      .eq('id', leadId)

    await supabase.from('interacoes_crm').insert({
      lead_id: leadId,
      tipo: 'nota',
      descricao: observacao || 'Follow-up agendado',
    })

    onAtualizar()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-3 rounded-xl bg-yellow-500/[0.08] border border-yellow-500/20">
        <Clock size={18} color="#FFB800" className="flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-400">
          {precisamFollowup.length} lead{precisamFollowup.length !== 1 ? 's' : ''} aguardando
          follow-up. Quanto mais rápido você agir, maior a chance de conversão.
        </p>
      </div>

      {precisamFollowup.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          titulo="Follow-ups em dia!"
          descricao="Nenhum lead aguardando contato no momento."
        />
      ) : (
        <div className="space-y-3">
          {precisamFollowup.map((lead) => (
            <CardFollowUp
              key={lead.id}
              lead={lead}
              onDefinirFollowup={definirFollowup}
              onMoverStatus={async (status) => {
                await supabase.from('captacoes').update({ status }).eq('id', lead.id)
                onAtualizar()
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== CARD FOLLOW-UP ====================

function CardFollowUp({
  lead,
  onDefinirFollowup,
  onMoverStatus,
}: {
  lead: LeadCRM
  onDefinirFollowup: (leadId: string, data: string, observacao: string) => void
  onMoverStatus: (status: string) => void
}) {
  const [expandido, setExpandido] = useState(false)
  const [novaData, setNovaData] = useState('')
  const [nota, setNota] = useState('')

  const diasAtraso = lead.data_followup
    ? differenceInDays(new Date(), new Date(lead.data_followup))
    : differenceInDays(new Date(), new Date(lead.criado_em))

  return (
    <div
      className={`bg-[#161616] border rounded-2xl overflow-hidden transition-all ${
        diasAtraso > 5 ? 'border-red-500/30' : 'border-yellow-500/20'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-white">{lead.nome ?? 'Sem nome'}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  diasAtraso > 5
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-yellow-500/15 text-yellow-400'
                }`}
              >
                {diasAtraso > 0 ? `${diasAtraso}d atrasado` : 'hoje'}
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-0.5 capitalize">
              {lead.status?.replace('_', ' ')} · {lead.origem}
            </p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {lead.telefone && (
              <a
                href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#00E620]/15 border border-[#00E620]/20
                           flex items-center justify-center touch-manipulation"
              >
                <WhatsappLogo size={18} color="#00E620" weight="fill" />
              </a>
            )}
            <button
              onClick={() => setExpandido(!expandido)}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/5
                         flex items-center justify-center touch-manipulation"
            >
              <motion.div animate={{ rotate: expandido ? 180 : 0 }}>
                <CaretDown size={18} className="text-gray-400" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Ações rápidas de status */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[
            { status: 'respondeu', label: '✉️ Respondeu' },
            { status: 'call_marcada', label: '📅 Call marcada' },
            { status: 'convertido', label: '✅ Converteu' },
            { status: 'perdido', label: '❌ Perdido' },
          ].map((opcao) => (
            <button
              key={opcao.status}
              onClick={() => onMoverStatus(opcao.status)}
              className="px-3 py-1.5 rounded-xl text-xs border border-white/10
                         text-gray-400 hover:text-white hover:border-white/20
                         transition-all touch-manipulation"
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expandido: agendar próximo follow-up */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 space-y-3">
              <p className="text-xs font-medium text-gray-500">Agendar próximo follow-up</p>

              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 7].map((dias) => {
                  const dataAlvo = format(addDays(new Date(), dias), 'yyyy-MM-dd')
                  return (
                    <button
                      key={dias}
                      onClick={() => setNovaData(dataAlvo)}
                      className={`py-2 rounded-xl text-xs border transition-all touch-manipulation ${
                        novaData === dataAlvo
                          ? 'border-[#00E620] bg-[#00E620]/10 text-[#00E620]'
                          : 'border-white/10 text-gray-400'
                      }`}
                    >
                      +{dias}d
                    </button>
                  )
                })}
              </div>

              <input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                className="w-full bg-[#111] border border-white/5 rounded-xl
                           px-3 py-2 text-white text-sm outline-none
                           focus:border-[#00E620] transition-colors"
              />

              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="O que foi combinado? O que observou?"
                rows={2}
                className="w-full bg-[#111] border border-white/5 rounded-xl
                           px-3 py-2.5 text-white placeholder:text-gray-600
                           text-sm outline-none resize-none focus:border-[#00E620]
                           transition-colors"
              />

              <button
                disabled={!novaData}
                onClick={() => {
                  onDefinirFollowup(lead.id, novaData, nota)
                  setExpandido(false)
                  setNovaData('')
                  setNota('')
                }}
                className="w-full py-2.5 rounded-xl bg-[#00E620] text-black font-bold
                           text-sm touch-manipulation disabled:opacity-30"
              >
                Salvar agendamento
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
