import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimerDescansoProps {
  segundos: number
  onPular: () => void
  onConcluir: () => void
}

export default function TimerDescanso({ segundos, onPular, onConcluir }: TimerDescansoProps) {
  const [restante, setRestante] = useState(segundos)
  const progresso = (restante / segundos) * 100

  useEffect(() => {
    if (restante <= 0) {
      onConcluir()
      return
    }
    const timer = setTimeout(() => setRestante((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [restante, onConcluir])

  // Vibrate on finish and 3s warning
  useEffect(() => {
    if (restante === 0 && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200])
    }
    if (restante === 3 && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
  }, [restante])

  const cor =
    restante > segundos * 0.5
      ? '#00E620'
      : restante > segundos * 0.25
        ? '#FFB800'
        : '#FF4444'

  const circumference = 2 * Math.PI * 45

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[70] flex items-end justify-center pb-8 bg-black/80 backdrop-blur-md sm:items-center"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 32px)' }}
    >
      <div className="bg-[#161616] rounded-3xl p-8 mx-4 w-full max-w-sm border border-white/10 text-center space-y-6">
        {/* Progress ring */}
        <div className="relative w-36 h-36 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1a1a" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="6"
              stroke={cor}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progresso / 100)}
              style={{
                transition: 'stroke-dashoffset 1s linear, stroke 0.5s',
                filter: `drop-shadow(0 0 8px ${cor}80)`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-5xl text-white">{restante}</span>
            <span className="text-gray-500 text-xs">segundos</span>
          </div>
        </div>

        <div>
          <p className="text-xl font-bold text-white">Descansando...</p>
          <p className="text-gray-500 text-sm mt-1">
            Próxima série em {restante} segundo{restante !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Time adjustments */}
        <div className="flex gap-2 justify-center">
          {[-15, -10, 10, 15].map((delta) => (
            <button
              key={delta}
              onClick={() => setRestante((r) => Math.max(0, r + delta))}
              className={`px-3 py-2 rounded-xl text-sm border touch-manipulation ${
                delta < 0
                  ? 'border-red-500/30 text-red-400 bg-red-500/10'
                  : 'border-[#00E620]/30 text-[#00E620] bg-[#00E620]/10'
              }`}
            >
              {delta > 0 ? '+' : ''}
              {delta}s
            </button>
          ))}
        </div>

        <button
          onClick={onPular}
          className="w-full py-3 rounded-2xl bg-[#00E620] text-black font-bold shadow-[0_0_20px_rgba(0,230,32,0.4)] touch-manipulation"
        >
          Pular descanso →
        </button>
      </div>
    </motion.div>
  )
}
