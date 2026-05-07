import { motion } from 'framer-motion'
import { CalendarX, Clock, CheckCircle, WhatsappLogo } from '@phosphor-icons/react'
import EmptyState from '../ui/EmptyState'
import type { AlertaCRM } from '../../pages/CRM'

interface Props {
  alertas: AlertaCRM[]
}

export default function AlertasCRM({ alertas }: Props) {
  const alertasVencimento = alertas.filter((a) => a.tipo !== 'followup')
  const alertasFollowup = alertas.filter((a) => a.tipo === 'followup')

  if (alertas.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        titulo="Nenhum alerta no momento"
        descricao="Todos os planos estão em dia e nenhum follow-up está atrasado."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Vencimentos */}
      {alertasVencimento.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <CalendarX size={20} color="#FF4444" />
            Vencimentos de Planos
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
              {alertasVencimento.length}
            </span>
          </h3>

          {alertasVencimento.map((alerta) => (
            <CardAlerta key={alerta.id} alerta={alerta} />
          ))}
        </div>
      )}

      {/* Follow-ups atrasados */}
      {alertasFollowup.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Clock size={20} color="#FFB800" />
            Follow-ups Pendentes
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
              {alertasFollowup.length}
            </span>
          </h3>

          {alertasFollowup.map((alerta) => (
            <CardAlerta key={alerta.id} alerta={alerta} />
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== CARD ALERTA ====================

function CardAlerta({ alerta }: { alerta: AlertaCRM }) {
  const config = {
    vencido: {
      cor: '#FF4444',
      bg: 'rgba(255,68,68,0.08)',
      borda: 'rgba(255,68,68,0.25)',
      emoji: '🚨',
    },
    vencendo: {
      cor: '#FF8C00',
      bg: 'rgba(255,140,0,0.08)',
      borda: 'rgba(255,140,0,0.25)',
      emoji: '⚠️',
    },
    aviso: {
      cor: '#FFB800',
      bg: 'rgba(255,184,0,0.08)',
      borda: 'rgba(255,184,0,0.25)',
      emoji: '📅',
    },
    followup: {
      cor: '#FFB800',
      bg: 'rgba(255,184,0,0.08)',
      borda: 'rgba(255,184,0,0.25)',
      emoji: '📞',
    },
  }[alerta.tipo]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl p-4 flex items-start gap-4 border"
      style={{ background: config.bg, borderColor: config.borda }}
    >
      {/* Icone */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: config.cor + '20' }}
      >
        {config.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm">{alerta.titulo}</p>
        <p className="text-xs mt-0.5" style={{ color: config.cor }}>
          {alerta.descricao}
        </p>

        {/* Ações */}
        <div className="flex gap-2 mt-3">
          {alerta.telefone && (
            <a
              href={`https://wa.me/55${alerta.telefone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                         bg-[#00E620]/15 border border-[#00E620]/20 text-[#00E620] text-xs
                         font-medium touch-manipulation hover:bg-[#00E620]/25 transition-all"
            >
              <WhatsappLogo size={14} weight="fill" />
              Contatar agora
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
