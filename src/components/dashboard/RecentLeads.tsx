import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { useLeadsStore } from '../../store/leadsStore'
import { useFeedbackStore } from '../../store/feedbackStore'
import Badge from '../ui/Badge'
import { User, ChatText, Star } from '@phosphor-icons/react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
}

function LeadInitials({ nome }: { nome: string }) {
  const initials = nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="w-9 h-9 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-xs font-bold shrink-0">
      {initials}
    </div>
  )
}

const emojis = ['', '😴', '😕', '🙂', '💪', '🔥']

export default function RecentLeads() {
  const leads = useLeadsStore((s) => s.leads)
  const feedbacks = useFeedbackStore((s) => s.feedbacks)

  const recentLeads = [...leads]
    .sort(
      (a, b) =>
        new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    )
    .slice(0, 8)

  const recentFeedbacks = feedbacks.slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Recent Leads */}
      <div className="glow-surface relative overflow-hidden bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-brand-green" />
          <h3 className="text-sm font-medium text-gray-400">Leads Recentes</h3>
        </div>
        {recentLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600">
            <User size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Nenhum lead registrado ainda</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {recentLeads.map((lead) => (
              <motion.div
                key={lead.id}
                variants={itemVariants}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
              >
                <LeadInitials nome={lead.nome} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {lead.nome}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(lead.criadoEm), 'dd MMM, HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <Badge type="status" value={lead.status} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Recent Feedbacks */}
      <div className="glow-surface relative overflow-hidden bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ChatText size={16} className="text-brand-green" />
          <h3 className="text-sm font-medium text-gray-400">
            Feedbacks Recentes
          </h3>
        </div>
        {recentFeedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600">
            <ChatText size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Nenhum feedback recebido ainda</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {recentFeedbacks.map((fb) => (
              <motion.div
                key={fb.id}
                variants={itemVariants}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                  !fb.lido ? 'bg-[#00E620]/5' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-xs font-bold shrink-0">
                  {fb.alunoNome.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-white font-medium truncate">
                      {fb.alunoNome}
                    </p>
                    <span className="text-sm">{emojis[fb.sensacao]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        weight={i < fb.sensacao ? 'fill' : 'regular'}
                        className={
                          i < fb.sensacao ? 'text-yellow-400' : 'text-gray-700'
                        }
                      />
                    ))}
                  </div>
                </div>
                {!fb.lido && (
                  <span className="w-2 h-2 rounded-full bg-[#00E620]" />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
