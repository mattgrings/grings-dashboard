import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Phone, InstagramLogo, EnvelopeSimple, Pencil, Trash } from '@phosphor-icons/react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import type { Lead } from '../../types'

interface LeadCardProps {
  lead: Lead
  onScheduleCall?: (lead: Lead) => void
  onEdit?: (lead: Lead) => void
  onDelete?: (lead: Lead) => void
}

export default function LeadCard({ lead, onScheduleCall, onEdit, onDelete }: LeadCardProps) {
  const initials = lead.nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <motion.div
      whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(0, 230, 32, 0.1)' }}
      className="glow-surface relative overflow-hidden bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-4 hover:border-brand-green/15 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white truncate">{lead.nome}</h3>
            <Badge type="status" value={lead.status} />
            {/* Edit/Delete */}
            <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(lead) }}
                  className="w-7 h-7 rounded-lg bg-[#111111] border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#00E620] hover:border-[#00E620]/30 transition-all touch-manipulation"
                  title="Editar"
                >
                  <Pencil size={12} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(lead) }}
                  className="w-7 h-7 rounded-lg bg-[#111111] border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all touch-manipulation"
                  title="Excluir"
                >
                  <Trash size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Phone size={12} />
              {lead.telefone}
            </span>
            {lead.instagram && (
              <span className="flex items-center gap-1">
                <InstagramLogo size={12} />
                {lead.instagram}
              </span>
            )}
            {lead.email && (
              <span className="flex items-center gap-1">
                <EnvelopeSimple size={12} />
                {lead.email}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Badge type="origem" value={lead.origem} />
            <span className="text-xs text-gray-600">
              {format(new Date(lead.criadoEm), "dd MMM yyyy, HH:mm", { locale: ptBR })}
            </span>
          </div>

          {lead.observacoes && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{lead.observacoes}</p>
          )}

          {lead.status !== 'convertido' && lead.status !== 'perdido' && onScheduleCall && (
            <Button size="sm" variant="secondary" onClick={() => onScheduleCall(lead)}>
              <Phone size={14} />
              Agendar Chamada
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
