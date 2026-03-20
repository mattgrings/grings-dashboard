import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Clock, Phone } from '@phosphor-icons/react'
import Badge from '../ui/Badge'
import type { Chamada } from '../../types'

interface AgendaViewProps {
  chamadas: Chamada[]
  selectedDate: Date
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
}

export default function AgendaView({ chamadas, selectedDate }: AgendaViewProps) {
  const dayChamadas = chamadas
    .filter((c) => isSameDay(new Date(c.dataHora), selectedDate))
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())

  return (
    <div className="glow-surface relative overflow-hidden bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white capitalize">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </h3>
        <span className="text-xs text-gray-500">{dayChamadas.length} evento(s)</span>
      </div>

      {dayChamadas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <Clock size={32} className="mb-2 opacity-40" />
          <p className="text-sm">Nenhum evento neste dia</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
          {dayChamadas.map((chamada) => {
            const initials = chamada.lead.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
            return (
              <motion.div
                key={chamada.id}
                variants={itemVariants}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-medium truncate">{chamada.lead.nome}</p>
                    <Badge type="chamada" value={chamada.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {format(new Date(chamada.dataHora), 'HH:mm')}
                    </span>
                    {chamada.duracao && <span>{chamada.duracao}min</span>}
                    <span className="flex items-center gap-1">
                      <Phone size={11} />
                      {chamada.lead.telefone}
                    </span>
                  </div>
                  {chamada.notas && (
                    <p className="text-xs text-gray-600 mt-1 truncate">{chamada.notas}</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
