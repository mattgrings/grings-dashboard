import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChatText,
  Star,
  PaperPlaneRight,
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import { useFeedbackStore } from '../../store/feedbackStore'
import { useNotificacoesStore } from '../../store/notificacoesStore'
import type { Feedback } from '../../store/feedbackStore'
import EmptyState from '../../components/ui/EmptyState'

const emojis = ['', '😴', '😕', '🙂', '💪', '🔥']
const sensacaoLabels = ['', 'Muito difícil', 'Difícil', 'Boa', 'Ótima', 'Incrível']

const tipoOptions: { value: Feedback['tipo']; label: string }[] = [
  { value: 'geral', label: 'Geral' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'dificuldade', label: 'Dificuldade' },
]

export default function AlunoFeedback() {
  const user = useAuthStore((s) => s.user)
  const feedbacks = useFeedbackStore((s) => s.feedbacks)
  const addFeedback = useFeedbackStore((s) => s.addFeedback)
  const addNotificacao = useNotificacoesStore((s) => s.addNotificacao)

  const [tipo, setTipo] = useState<Feedback['tipo']>('geral')
  const [sensacao, setSensacao] = useState<number>(0)
  const [mensagem, setMensagem] = useState('')
  const [enviado, setEnviado] = useState(false)

  const meusFeedbacks = feedbacks
    .filter((f) => f.alunoId === user?.id)
    .slice(0, 10)

  const handleEnviar = () => {
    if (!user || sensacao === 0) return

    const feedbackId = addFeedback({
      alunoId: user.id,
      alunoNome: user.nome,
      tipo,
      sensacao: sensacao as 1 | 2 | 3 | 4 | 5,
      mensagem,
    })

    addNotificacao({
      tipo: 'feedback',
      titulo: `Novo feedback de ${user.nome}`,
      mensagem: `${sensacao}⭐ — "${mensagem.slice(0, 80)}"`,
      alunoId: user.id,
      alunoNome: user.nome,
      referencia: feedbackId,
    })

    setEnviado(true)
    setSensacao(0)
    setMensagem('')
    setTipo('geral')
    setTimeout(() => setEnviado(false), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ChatText size={24} className="text-[#00E620]" />
          Meus Feedbacks
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Envie feedbacks para seu consultor
        </p>
      </div>

      {/* New feedback form */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-medium">Novo Feedback</h3>

        {enviado && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#00E620]/10 border border-[#00E620]/20 rounded-xl p-3 text-center"
          >
            <p className="text-[#00E620] text-sm font-medium">
              Feedback enviado com sucesso! ✓
            </p>
          </motion.div>
        )}

        {/* Type */}
        <div className="flex gap-2">
          {tipoOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTipo(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                tipo === opt.value
                  ? 'bg-[#00E620]/10 border-[#00E620]/30 text-[#00E620]'
                  : 'bg-[#111] border-white/10 text-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sensation */}
        <div className="flex justify-between gap-2">
          {emojis.slice(1).map((emoji, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.85 }}
              onClick={() => setSensacao(i + 1)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl
                          border transition-all touch-manipulation text-2xl
                          ${
                            sensacao === i + 1
                              ? 'border-[#00E620] bg-[#00E620]/10 shadow-[0_0_12px_rgba(0,230,32,0.3)]'
                              : 'border-white/10 bg-[#111]'
                          }`}
            >
              {emoji}
              <span className="text-[10px] text-gray-400">
                {sensacaoLabels[i + 1]}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Message */}
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Escreva seu feedback..."
          rows={3}
          className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3
                     text-white placeholder:text-gray-600 outline-none resize-none
                     focus:border-[#00E620] transition-colors"
        />

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={sensacao === 0}
          onClick={handleEnviar}
          className="w-full py-3.5 rounded-xl font-bold text-black bg-[#00E620]
                     shadow-[0_0_20px_rgba(0,230,32,0.3)]
                     disabled:opacity-30 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2 touch-manipulation"
        >
          <PaperPlaneRight size={18} weight="bold" />
          Enviar Feedback
        </motion.button>
      </div>

      {/* History */}
      <div>
        <h3 className="text-white font-medium mb-3">Histórico</h3>
        {meusFeedbacks.length === 0 ? (
          <EmptyState
            icon={<ChatText size={40} />}
            title="Nenhum feedback enviado"
            description="Seus feedbacks anteriores aparecerão aqui"
          />
        ) : (
          <div className="space-y-2">
            {meusFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-[#141414] border border-white/5 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{emojis[fb.sensacao]}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        weight={i < fb.sensacao ? 'fill' : 'regular'}
                        className={
                          i < fb.sensacao
                            ? 'text-yellow-400'
                            : 'text-gray-700'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500 ml-auto">
                    {new Date(fb.criadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {fb.mensagem && (
                  <p className="text-sm text-gray-300">"{fb.mensagem}"</p>
                )}
                {fb.lido && (
                  <p className="text-[10px] text-[#00E620] mt-1">✓ Visto pelo consultor</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
