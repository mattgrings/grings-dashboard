import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowsClockwise } from '@phosphor-icons/react'

interface BotaoConfig {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
}

interface BottomSheetProps {
  aberto: boolean
  onFechar: () => void
  titulo: string
  children: React.ReactNode
  botaoPrimario?: BotaoConfig
  botaoSecundario?: BotaoConfig
}

export default function BottomSheet({
  aberto,
  onFechar,
  titulo,
  children,
  botaoPrimario,
  botaoSecundario,
}: BottomSheetProps) {
  // Block body scroll when open
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [aberto])

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
          />

          {/* Sheet */}
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-50 flex flex-col
                       bg-[#161616] rounded-t-3xl
                       sm:relative sm:rounded-2xl sm:max-w-lg sm:mx-auto sm:my-8"
            style={{
              maxHeight: '92dvh',
              paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 flex-shrink-0">
              <h2 className="text-lg font-bold text-white">{titulo}</h2>
              <button
                onClick={onFechar}
                className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center
                           text-gray-500 hover:text-white transition-colors touch-manipulation"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content with scroll */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-4"
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
            >
              {children}
            </div>

            {/* Buttons always fixed at bottom */}
            {(botaoPrimario || botaoSecundario) && (
              <div className="flex-shrink-0 px-5 py-4 border-t border-white/5 bg-[#161616] space-y-2">
                {botaoPrimario && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={botaoPrimario.onClick}
                    disabled={botaoPrimario.disabled}
                    className="w-full py-4 rounded-2xl font-bold text-base text-black
                               bg-[#00E620] shadow-[0_0_20px_rgba(0,230,32,0.4)]
                               disabled:opacity-40 disabled:cursor-not-allowed
                               touch-manipulation active:scale-95 transition-all"
                  >
                    {botaoPrimario.loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <ArrowsClockwise size={20} className="animate-spin" />
                        {botaoPrimario.loadingLabel ?? 'Salvando...'}
                      </span>
                    ) : (
                      botaoPrimario.label
                    )}
                  </motion.button>
                )}
                {botaoSecundario && (
                  <button
                    onClick={botaoSecundario.onClick}
                    className="w-full py-3 rounded-xl text-sm text-gray-500
                               hover:text-white transition-colors touch-manipulation"
                  >
                    {botaoSecundario.label}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
