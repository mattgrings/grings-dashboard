import { motion } from 'framer-motion'
import { Trophy } from '@phosphor-icons/react'
import { CONQUISTAS } from '../../types/gamificacao'
import type { ConquistaDesbloqueada } from '../../types/gamificacao'

interface ConquistasWidgetProps {
  desbloqueadas: ConquistaDesbloqueada[]
}

const raridadeBorder: Record<string, string> = {
  lendario: 'border-yellow-400/40 bg-yellow-400/10',
  epico: 'border-purple-400/40 bg-purple-400/10',
  raro: 'border-blue-400/40 bg-blue-400/10',
  comum: 'border-white/5 bg-[#161616]',
}

export default function ConquistasWidget({ desbloqueadas }: ConquistasWidgetProps) {
  const conquistasInfo = desbloqueadas
    .map((d) => CONQUISTAS.find((c) => c.id === d.conquistaId))
    .filter(Boolean)

  if (conquistasInfo.length === 0) {
    return (
      <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" weight="fill" />
          <h3 className="font-bold text-white text-sm">Conquistas</h3>
        </div>
        <p className="text-gray-500 text-sm">
          Continue treinando para desbloquear conquistas!
        </p>
        <div className="flex gap-2">
          {CONQUISTAS.slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg opacity-30"
            >
              {c.emoji}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" weight="fill" />
          <h3 className="font-bold text-white text-sm">Suas Conquistas</h3>
        </div>
        <span className="text-xs text-gray-500">
          {conquistasInfo.length}/{CONQUISTAS.length}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {conquistasInfo.map((c) => (
          <motion.div
            key={c!.id}
            whileHover={{ scale: 1.05 }}
            className={`flex-shrink-0 w-20 flex flex-col items-center gap-1 p-3 rounded-2xl border text-center ${
              raridadeBorder[c!.raridade]
            }`}
          >
            <span className="text-2xl">{c!.emoji}</span>
            <p className="text-[10px] text-gray-400 leading-tight">{c!.titulo}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
