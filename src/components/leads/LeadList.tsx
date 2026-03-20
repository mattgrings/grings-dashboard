import { motion } from 'framer-motion'
import type { Lead } from '../../types'
import LeadCard from './LeadCard'

interface LeadListProps {
  leads: Lead[]
  onScheduleCall?: (lead: Lead) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

export default function LeadList({ leads, onScheduleCall }: LeadListProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-600">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4 opacity-40">
          <rect x="8" y="12" width="48" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
          <path d="M24 28h16M24 36h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-sm">Nenhum lead encontrado</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {leads.map((lead) => (
        <motion.div key={lead.id} variants={cardVariants}>
          <LeadCard lead={lead} onScheduleCall={onScheduleCall} />
        </motion.div>
      ))}
    </motion.div>
  )
}
