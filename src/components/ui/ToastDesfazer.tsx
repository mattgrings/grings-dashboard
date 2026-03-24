import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash, X } from '@phosphor-icons/react'
import { registrarToastCallback } from '../../lib/deletarComDesfazer'

interface ToastState {
  visivel: boolean
  mensagem: string
  onDesfazer: (() => void) | null
  key: number
}

export default function ToastDesfazer() {
  const [state, setState] = useState<ToastState>({
    visivel: false,
    mensagem: '',
    onDesfazer: null,
    key: 0,
  })
  const [progresso, setProgresso] = useState(100)

  const fechar = useCallback(() => {
    setState((s) => ({ ...s, visivel: false, onDesfazer: null }))
  }, [])

  // Registrar callback global
  useEffect(() => {
    registrarToastCallback((msg, fn) => {
      setState((s) => ({
        visivel: true,
        mensagem: msg,
        onDesfazer: fn,
        key: s.key + 1,
      }))
    })
  }, [])

  // Progresso timer
  useEffect(() => {
    if (!state.visivel) return

    setProgresso(100)
    const inicio = Date.now()
    const duracao = 5000

    const interval = setInterval(() => {
      const decorrido = Date.now() - inicio
      const restante = Math.max(0, 100 - (decorrido / duracao) * 100)
      setProgresso(restante)
      if (restante <= 0) {
        clearInterval(interval)
        fechar()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [state.visivel, state.key, fechar])

  return (
    <AnimatePresence>
      {state.visivel && (
        <motion.div
          key={state.key}
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 z-[200] sm:left-auto sm:right-6 sm:w-80"
          style={{
            bottom: `calc(max(env(safe-area-inset-bottom, 20px), 20px) + 80px)`,
          }}
        >
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            {/* Barra de progresso */}
            <div className="h-1 bg-white/5">
              <div
                className="h-full bg-[#00E620] transition-all duration-50"
                style={{ width: `${progresso}%` }}
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <Trash size={18} className="text-gray-400 flex-shrink-0" />
              <p className="flex-1 text-sm text-white">{state.mensagem}</p>
              <button
                onClick={() => {
                  state.onDesfazer?.()
                  fechar()
                }}
                className="px-3 py-1.5 rounded-xl bg-[#00E620] text-black font-bold text-xs touch-manipulation flex-shrink-0 shadow-[0_0_10px_rgba(0,230,32,0.4)]"
              >
                Desfazer
              </button>
              <button
                onClick={fechar}
                className="touch-manipulation text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
