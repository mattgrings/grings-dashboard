import type { StatusLead, OrigemLead, StatusChamada } from '../../types'

const statusColors: Record<StatusLead, string> = {
  novo: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  contactado: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  agendado: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  convertido: 'bg-brand-green/15 text-brand-green border-brand-green/20',
  perdido: 'bg-red-500/15 text-red-400 border-red-500/20',
}

const statusLabels: Record<StatusLead, string> = {
  novo: 'Novo',
  contactado: 'Contactado',
  agendado: 'Agendado',
  convertido: 'Convertido',
  perdido: 'Perdido',
}

const origemColors: Record<OrigemLead, string> = {
  instagram: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  whatsapp: 'bg-green-500/15 text-green-400 border-green-500/20',
  indicacao: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  trafego_pago: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  outro: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
}

const origemLabels: Record<OrigemLead, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  indicacao: 'Indicação',
  trafego_pago: 'Tráfego Pago',
  outro: 'Outro',
}

const chamadaColors: Record<StatusChamada, string> = {
  agendada: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  realizada: 'bg-brand-green/15 text-brand-green border-brand-green/20',
  faltou: 'bg-red-500/15 text-red-400 border-red-500/20',
  remarcada: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
}

const chamadaLabels: Record<StatusChamada, string> = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  faltou: 'Faltou',
  remarcada: 'Remarcada',
}

interface BadgeProps {
  type: 'status' | 'origem' | 'chamada'
  value: string
}

export default function Badge({ type, value }: BadgeProps) {
  let color = ''
  let label = ''

  if (type === 'status') {
    color = statusColors[value as StatusLead] || ''
    label = statusLabels[value as StatusLead] || value
  } else if (type === 'origem') {
    color = origemColors[value as OrigemLead] || ''
    label = origemLabels[value as OrigemLead] || value
  } else if (type === 'chamada') {
    color = chamadaColors[value as StatusChamada] || ''
    label = chamadaLabels[value as StatusChamada] || value
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  )
}
