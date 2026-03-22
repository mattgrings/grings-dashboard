import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import Logo from '../ui/Logo'
import { useFeedbackStore } from '../../store/feedbackStore'
import { useNotificacoesStore } from '../../store/notificacoesStore'

interface ModalFeedbackProps {
  aberto: boolean
  sessaoId?: string
  alunoId: string
  alunoNome: string
  onConcluir: () => void
}

const emojis = ['😴', '😕', '🙂', '💪', '🔥']
const labels = ['Muito difícil', 'Difícil', 'Boa', 'Ótima', 'Incrível!']

export default function ModalFeedback({
  aberto,
  sessaoId,
  alunoId,
  alunoNome,
  onConcluir,
}: ModalFeedbackProps) {
  const [sensacao, setSensacao] = useState<number>(0)
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const addFeedback = useFeedbackStore((s) => s.addFeedback)
  const addNotificacao = useNotificacoesStore((s) => s.addNotificacao)

  const handleEnviar = () => {
    if (sensacao === 0) return
    setEnviando(true)

    const feedbackId = addFeedback({
      alunoId,
      alunoNome,
      sessaoId,
      tipo: 'pos_treino',
      sensacao: sensacao as 1 | 2 | 3 | 4 | 5,
      mensagem,
    })

    addNotificacao({
      tipo: 'feedback',
      titulo: `Novo feedback de ${alunoNome}`,
      mensagem: `${sensacao}⭐ — "${mensagem.slice(0, 80)}${mensagem.length > 80 ? '...' : ''}"`,
      alunoId,
      alunoNome,
      referencia: feedbackId,
    })

    setTimeout(() => {
      setEnviando(false)
      setSensacao(0)
      setMensagem('')
      onConcluir()
    }, 300)
  }

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-[#141414] border border-white/10 rounded-t-3xl
                       sm:rounded-3xl p-6 sm:mx-4 max-h-[85vh] overflow-y-auto"
          >
            {/* Close */}
            <button
              onClick={onConcluir}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Logo size="sm" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Treino finalizado! 🎉
                </h2>
                <p className="text-gray-400 text-sm">
                  Como foi sua sessão hoje?
                </p>
              </div>

              {/* Sensation selector */}
              <div className="flex justify-between gap-2">
                {emojis.map((emoji, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSensacao(i + 1)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl
                                border transition-all touch-manipulation text-2xl
                                ${
                                  sensacao === i + 1
                                    ? 'border-[#00E620] bg-[#00E620]/10 shadow-[0_0_12px_rgba(0,230,32,0.3)]'
                                    : 'border-white/10 bg-[#111111]'
                                }`}
                  >
                    {emoji}
                    <span className="text-[10px] text-gray-400">
                      {labels[i]}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Deixe um comentário (opcional)
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Como foi o treino? Alguma dificuldade?"
                  rows={3}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3
                             text-white placeholder:text-gray-600 outline-none resize-none
                             focus:border-[#00E620] transition-colors"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={sensacao === 0 || enviando}
                onClick={handleEnviar}
                className="w-full py-4 rounded-2xl font-bold text-lg text-black
                           bg-[#00E620] shadow-[0_0_25px_rgba(0,230,32,0.4)]
                           disabled:opacity-30 disabled:cursor-not-allowed
                           touch-manipulation"
              >
                {enviando ? 'Enviando...' : 'Enviar feedback'}
              </motion.button>

              <button
                onClick={onConcluir}
                className="w-full text-sm text-gray-600 py-2 touch-manipulation hover:text-gray-400 transition-colors"
              >
                Pular por agora
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
