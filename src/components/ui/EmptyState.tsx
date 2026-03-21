import { motion } from 'framer-motion'
import type { Icon } from '@phosphor-icons/react'

interface EmptyStateProps {
  icon: Icon
  titulo: string
  descricao: string
  acaoLabel?: string
  onAcao?: () => void
}

export default function EmptyState({ icon: IconComponent, titulo, descricao, acaoLabel, onAcao }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-20 h-20 rounded-2xl bg-[#161616] border border-[#00E620]/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,230,32,0.1)]">
        <IconComponent size={40} className="text-[#00E620] opacity-60" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{titulo}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{descricao}</p>
      {acaoLabel && onAcao && (
        <button
          onClick={onAcao}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E620] text-black font-semibold text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,230,32,0.3)]"
        >
          {acaoLabel}
        </button>
      )}
    </motion.div>
  )
}
